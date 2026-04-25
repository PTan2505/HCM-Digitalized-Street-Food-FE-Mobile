import type { PaginatedVendors, Vendor } from '@features/customer/home/types/vendor';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

export const useVendors = (): {
  vendors: Vendor[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
} => {
  const {
    data,
    fetchNextPage,
    hasNextPage = false,
    isLoading,
    isError,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedVendors>({
    queryKey: queryKeys.vendors.all,
    queryFn: ({ pageParam = 1 }) =>
      axiosApi.vendorApi.getVendors(pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const vendors = data?.pages.flatMap((page) => page.items) ?? [];

  return { vendors, fetchNextPage, hasNextPage, isLoading, isError, isFetchingNextPage };
};
