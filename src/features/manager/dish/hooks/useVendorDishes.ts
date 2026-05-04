import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type {
  PaginatedVendorDishes,
  VendorDish,
} from '@manager/menu/api/managerDishApi';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseVendorDishesResult {
  dishes: VendorDish[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export const useVendorDishes = (
  vendorId: number | undefined,
  keyword?: string
): UseVendorDishesResult => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.managerDishes.byVendor(vendorId ?? 0, keyword ?? ''),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      axiosApi.managerDishApi.getVendorDishes(vendorId ?? 0, {
        pageNumber: pageParam,
        pageSize: 10,
        ...(keyword && keyword.trim() !== '' ? { keyword } : {}),
      }),
    enabled: vendorId != null && vendorId > 0,
    getNextPageParam: (lastPage: PaginatedVendorDishes) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  return {
    dishes: query.data?.pages.flatMap((p) => p.items) ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isLoadingMore: query.isFetchingNextPage,
    hasNext: query.hasNextPage ?? false,
    loadMore: () => void query.fetchNextPage(),
    refresh: () => void query.refetch(),
  };
};
