import { useCallback } from 'react';

import type { Feedback } from '@features/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import type { PaginatedFeedback } from '@features/home/types/feedback';

export type ReviewSortBy =
  | 'default'
  | 'most_helpful'
  | 'highest_rating'
  | 'lowest_rating';

interface UseReviewListParams {
  branchId: number;
  sortBy: ReviewSortBy;
  ownFeedbackId?: number;
  pageSize?: number;
}

export interface ReviewListResult {
  reviews: Feedback[];
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  voteFeedback: (feedbackId: number, voteType: 'up' | 'down') => void;
  deleteFeedback: (feedbackId: number) => Promise<void>;
}

/**
 * Sort reviews according to the selected sort mode. When sortBy is 'default',
 * the user's own review (if any) is placed first, followed by others sorted
 * by netScore descending (most helpful).
 */
const sortReviews = (
  reviews: Feedback[],
  sortBy: ReviewSortBy,
  ownFeedbackId?: number
): Feedback[] => {
  const sorted = [...reviews];

  switch (sortBy) {
    case 'default': {
      // Own review first, then sort others by helpfulness (netScore)
      const ownReview = sorted.find((r) => r.id === ownFeedbackId);
      const others = sorted
        .filter((r) => r.id !== ownFeedbackId)
        .sort((a, b) => b.netScore - a.netScore);
      return ownReview ? [ownReview, ...others] : others;
    }
    case 'most_helpful':
      return sorted.sort((a, b) => b.netScore - a.netScore);
    case 'highest_rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'lowest_rating':
      return sorted.sort((a, b) => a.rating - b.rating);
    default:
      return sorted;
  }
};

/**
 * Hook for fetching paginated reviews with sorting support.
 * Uses React Query's infinite query for pagination.
 * Includes optimistic update handlers for voting and deletion.
 */
export const useReviewList = ({
  branchId,
  sortBy,
  ownFeedbackId,
  pageSize = 20,
}: UseReviewListParams): ReviewListResult => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.feedback.list(branchId, sortBy);

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await axiosApi.feedbackApi.getBranchFeedback(branchId, {
        pageNumber: pageParam,
        pageSize,
      });
      return result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1 * 60 * 1000, // 1 min cache
  });

  /**
   * Optimistically update a feedback item in the cache.
   */
  const updateFeedbackInCache = useCallback(
    (feedbackId: number, updater: (feedback: Feedback) => Feedback) => {
      queryClient.setQueryData<InfiniteData<PaginatedFeedback>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === feedbackId ? updater(item) : item
              ),
            })),
          };
        }
      );
    },
    [queryClient, queryKey]
  );

  /**
   * Handle voting on a feedback with optimistic updates.
   */
  const voteFeedback = useCallback(
    (feedbackId: number, voteType: 'up' | 'down') => {
      // Find the current feedback
      const allReviews = data?.pages.flatMap((page) => page.items) ?? [];
      const feedback = allReviews.find((f) => f.id === feedbackId);
      if (!feedback) return;

      // Calculate optimistic update
      const isSameVote = feedback.userVote === voteType;

      updateFeedbackInCache(feedbackId, (f) => {
        const updated = { ...f };
        if (isSameVote) {
          // Toggle off
          updated.userVote = null;
          if (voteType === 'up') updated.upVotes -= 1;
          else updated.downVotes -= 1;
          updated.netScore =
            voteType === 'up' ? f.netScore - 1 : f.netScore + 1;
        } else {
          // Undo previous vote if any
          if (f.userVote === 'up') {
            updated.upVotes -= 1;
            updated.netScore -= 1;
          }
          if (f.userVote === 'down') {
            updated.downVotes -= 1;
            updated.netScore += 1;
          }
          // Apply new vote
          updated.userVote = voteType;
          if (voteType === 'up') {
            updated.upVotes += 1;
            updated.netScore += 1;
          } else {
            updated.downVotes += 1;
            updated.netScore -= 1;
          }
        }
        return updated;
      });

      // Make API call and sync with server response
      axiosApi.feedbackApi
        .voteFeedback(feedbackId, voteType)
        .then((res) => {
          updateFeedbackInCache(feedbackId, (f) => ({
            ...f,
            upVotes: res.upVotes,
            downVotes: res.downVotes,
            userVote: res.userVote,
            netScore: res.upVotes - res.downVotes,
          }));
        })
        .catch(() => {
          // Revert on failure
          updateFeedbackInCache(feedbackId, () => feedback);
        });
    },
    [data?.pages, updateFeedbackInCache]
  );

  /**
   * Delete a feedback and remove from cache.
   */
  const deleteFeedback = useCallback(
    async (feedbackId: number) => {
      // Store original data for rollback
      const originalData =
        queryClient.getQueryData<InfiniteData<PaginatedFeedback>>(queryKey);

      // Optimistically remove from cache
      queryClient.setQueryData<InfiniteData<PaginatedFeedback>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== feedbackId),
            })),
          };
        }
      );

      try {
        await axiosApi.feedbackApi.deleteFeedback(feedbackId);
        // Also invalidate the branch feedback cache
        void queryClient.invalidateQueries({
          queryKey: queryKeys.feedback.branch(branchId),
        });
      } catch {
        // Rollback on failure
        if (originalData) {
          queryClient.setQueryData(queryKey, originalData);
        }
        throw new Error('Failed to delete feedback');
      }
    },
    [branchId, queryClient, queryKey]
  );

  // Flatten all pages and apply sorting
  const allReviews = data?.pages.flatMap((page) => page.items) ?? [];
  const sortedReviews = sortReviews(allReviews, sortBy, ownFeedbackId);

  return {
    reviews: sortedReviews,
    isLoading,
    error: error ? 'Không thể tải đánh giá. Vui lòng thử lại.' : null,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: (): void => {
      void fetchNextPage();
    },
    refetch: (): void => {
      void refetch();
    },
    voteFeedback,
    deleteFeedback,
  };
};
