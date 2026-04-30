import { useCallback } from 'react';

import type { Feedback } from '@features/customer/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Shape of the combined feedback data we cache as a single query.
 * Fetching feedbacks, average rating, and count in parallel then
 * storing them together means one cache key = one consistent snapshot.
 */
interface BranchFeedbackData {
  feedbacks: Feedback[];
  averageRating: number;
  totalCount: number;
  feedbackDetails: Record<string, number>;
}

export interface BranchFeedbackResult {
  feedbacks: Feedback[];
  averageRating: number;
  totalCount: number;
  feedbackDetails: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  addFeedback: (feedback: Feedback) => void;
  updateFeedback: (feedback: Feedback) => void;
  removeFeedback: (feedbackId: number) => void;
}

/**
 * Fetches and caches branch feedback, average rating, and review count.
 *
 * HOW THE CACHE UPDATE HELPERS WORK (addFeedback / updateFeedback / removeFeedback):
 *
 * Instead of local useState, we use `queryClient.setQueryData()` to directly
 * update the React Query cache. This is called an "optimistic update" — the UI
 * updates instantly without waiting for a refetch.
 *
 * Why this is better than useState:
 * 1. The data is shared — if another component reads the same cache key,
 *    it sees the update too (no prop drilling needed).
 * 2. Background refetches will eventually sync with the server,
 *    self-correcting any drift.
 * 3. Navigating away and back still shows the updated data (it's in the cache).
 *
 * `queryClient.setQueryData(key, updaterFn)` works like setState —
 * the updater receives the current cached value and returns the new one.
 */
export const useBranchFeedback = (branchId: number): BranchFeedbackResult => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.feedback.branch(branchId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<BranchFeedbackData> => {
      const [paginatedFeedback, ratingData, countData] = await Promise.all([
        axiosApi.feedbackApi.getBranchFeedback(branchId, {
          sortBy: 'most_helpful',
        }),
        axiosApi.feedbackApi.getAverageRating(branchId),
        axiosApi.feedbackApi.getFeedbackCount(branchId),
      ]);
      return {
        feedbacks: paginatedFeedback.items,
        averageRating: ratingData.averageRating,
        totalCount: paginatedFeedback.totalCount,
        feedbackDetails: countData.details,
      };
    },
    staleTime: 1 * 60 * 1000, // Reviews may change often — 1 min cache
  });

  const addFeedback = useCallback(
    (feedback: Feedback) => {
      queryClient.setQueryData<BranchFeedbackData>(queryKey, (old) => {
        if (!old) return old;
        const newCount = old.totalCount + 1;
        const newAvg =
          (old.averageRating * old.totalCount + feedback.rating) / newCount;
        const ratingKey = String(feedback.rating);
        return {
          feedbacks: [feedback, ...old.feedbacks],
          averageRating: newAvg,
          totalCount: newCount,
          feedbackDetails: {
            ...old.feedbackDetails,
            [ratingKey]: (old.feedbackDetails[ratingKey] ?? 0) + 1,
          },
        };
      });
    },
    [queryClient, queryKey]
  );

  const updateFeedback = useCallback(
    (feedback: Feedback) => {
      queryClient.setQueryData<BranchFeedbackData>(queryKey, (old) => {
        if (!old) return old;
        const oldFeedback = old.feedbacks.find((f) => f.id === feedback.id);
        const updatedFeedbacks = old.feedbacks.map((f) =>
          f.id === feedback.id ? feedback : f
        );

        let newAvg = old.averageRating;
        if (oldFeedback && oldFeedback.rating !== feedback.rating) {
          newAvg =
            (old.averageRating * old.totalCount -
              oldFeedback.rating +
              feedback.rating) /
            old.totalCount;
        }

        let newDetails = old.feedbackDetails;
        if (oldFeedback && oldFeedback.rating !== feedback.rating) {
          const oldKey = String(oldFeedback.rating);
          const newKey = String(feedback.rating);
          newDetails = {
            ...old.feedbackDetails,
            [oldKey]: Math.max(0, (old.feedbackDetails[oldKey] ?? 0) - 1),
            [newKey]: (old.feedbackDetails[newKey] ?? 0) + 1,
          };
        }

        return {
          feedbacks: updatedFeedbacks,
          averageRating: newAvg,
          totalCount: old.totalCount,
          feedbackDetails: newDetails,
        };
      });
    },
    [queryClient, queryKey]
  );

  const removeFeedback = useCallback(
    (feedbackId: number) => {
      queryClient.setQueryData<BranchFeedbackData>(queryKey, (old) => {
        if (!old) return old;
        const removed = old.feedbacks.find((f) => f.id === feedbackId);
        if (!removed) return old;

        const newCount = old.totalCount - 1;
        const newAvg =
          newCount === 0
            ? 0
            : (old.averageRating * old.totalCount - removed.rating) / newCount;

        const ratingKey = String(removed.rating);
        return {
          feedbacks: old.feedbacks.filter((f) => f.id !== feedbackId),
          averageRating: newAvg,
          totalCount: newCount,
          feedbackDetails: {
            ...old.feedbackDetails,
            [ratingKey]: Math.max(0, (old.feedbackDetails[ratingKey] ?? 0) - 1),
          },
        };
      });
    },
    [queryClient, queryKey]
  );

  return {
    feedbacks: data?.feedbacks ?? [],
    averageRating: data?.averageRating ?? 0,
    totalCount: data?.totalCount ?? 0,
    feedbackDetails: data?.feedbackDetails ?? {},
    isLoading,
    error: error ? 'Không thể tải đánh giá. Vui lòng thử lại.' : null,
    refetch: (): void => {
      void refetch();
    },
    addFeedback,
    updateFeedback,
    removeFeedback,
  };
};
