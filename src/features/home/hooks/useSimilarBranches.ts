import type { SimilarBranch } from '@features/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

export interface UseSimilarBranchesResult {
  branches: SimilarBranch[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const useSimilarBranches = (
  branchId: number
): UseSimilarBranchesResult => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.branches.similar(branchId),
      queryFn: ({ pageParam = 1 }) =>
        axiosApi.branchApi.getSimilarBranches(branchId, pageParam, 5),
      getNextPageParam: (lastPage) =>
        lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
    });

  const branches: SimilarBranch[] =
    data?.pages.flatMap((page) => page.items) ?? [];

  return {
    branches,
    isLoading,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: (): void => {
      void fetchNextPage();
    },
  };
};
