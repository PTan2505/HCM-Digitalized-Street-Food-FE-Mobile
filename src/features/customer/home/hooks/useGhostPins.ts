import type { ActiveBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useGhostPins = (): {
  branches: ActiveBranch[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
} => {
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.branches.allGhostPins,
    queryFn: ({ pageParam = 1 }) =>
      axiosApi.branchApi.getAllGhostPins(pageParam, 10),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  const branches: ActiveBranch[] =
    data?.pages.flatMap((page) => page.items) ?? [];

  return {
    branches,
    isLoading,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage: (): void => {
      void fetchNextPage();
    },
    refetch,
  };
};
