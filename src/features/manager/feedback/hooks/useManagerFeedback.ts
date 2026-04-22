import type {
  Feedback,
  FeedbackAverageRating,
  PaginatedFeedback,
  VendorReply,
} from '@features/customer/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { selectManagerBranchId } from '@slices/managerAuth';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useSelector } from 'react-redux';

interface ManagerFeedbackListResult {
  items: Feedback[];
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface ManagerFeedbackDetailResult {
  feedback: Feedback | null;
  isLoading: boolean;
}

export const useManagerFeedbackList = (): ManagerFeedbackListResult => {
  const branchId = useSelector(selectManagerBranchId);

  const query = useInfiniteQuery({
    queryKey: queryKeys.managerFeedback.list(branchId ?? 0),
    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<PaginatedFeedback> =>
      axiosApi.managerFeedbackApi.getFeedbacksByBranch(branchId ?? 0, {
        pageNumber: pageParam,
        pageSize: 15,
      }),
    getNextPageParam: (lastPage: PaginatedFeedback) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    staleTime: 0,
    enabled: (branchId ?? 0) > 0,
  });

  const items: Feedback[] =
    query.data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = query.data?.pages[0]?.totalCount ?? 0;

  return {
    items,
    totalCount,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isLoadingMore: query.isFetchingNextPage,
    hasNext: query.hasNextPage ?? false,
    loadMore: (): void => {
      void query.fetchNextPage();
    },
    refresh: (): void => {
      void query.refetch();
    },
  };
};

export const useManagerFeedbackDetail = (
  feedbackId: number
): ManagerFeedbackDetailResult => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.managerFeedback.detail(feedbackId),
    queryFn: (): Promise<Feedback> =>
      axiosApi.managerFeedbackApi.getFeedbackDetail(feedbackId),
    staleTime: 0,
    enabled: feedbackId > 0,
  });
  return { feedback: data ?? null, isLoading };
};

export const useCreateReply = (): UseMutationResult<
  VendorReply,
  Error,
  { feedbackId: number; content: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feedbackId,
      content,
    }: {
      feedbackId: number;
      content: string;
    }): Promise<VendorReply> =>
      axiosApi.managerFeedbackApi.createReply(feedbackId, content),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerFeedback.all,
      });
    },
  });
};

export const useUpdateReply = (): UseMutationResult<
  VendorReply,
  Error,
  { feedbackId: number; content: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feedbackId,
      content,
    }: {
      feedbackId: number;
      content: string;
    }): Promise<VendorReply> =>
      axiosApi.managerFeedbackApi.updateReply(feedbackId, content),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerFeedback.all,
      });
    },
  });
};

export const useDeleteReply = (): UseMutationResult<
  void,
  Error,
  { feedbackId: number }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feedbackId,
    }: {
      feedbackId: number;
    }): Promise<void> =>
      axiosApi.managerFeedbackApi.deleteReply(feedbackId),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerFeedback.all,
      });
    },
  });
};

export const useManagerFeedbackAverageRating = (): number | null => {
  const branchId = useSelector(selectManagerBranchId);
  const { data } = useQuery<FeedbackAverageRating>({
    queryKey: [...queryKeys.managerFeedback.list(branchId ?? 0), 'avgRating'],
    queryFn: (): Promise<FeedbackAverageRating> =>
      axiosApi.feedbackApi.getAverageRating(branchId ?? 0),
    staleTime: 60_000,
    enabled: (branchId ?? 0) > 0,
  });
  return data?.averageRating ?? null;
};
