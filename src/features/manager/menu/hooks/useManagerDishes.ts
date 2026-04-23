import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { VendorDish } from '@manager/menu/api/managerDishApi';
import {
  selectManagerBranchId,
  selectManagerVendorId,
} from '@slices/managerAuth';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

interface BranchDishListResult {
  dishes: VendorDish[];
  assignedIdSet: Set<number>;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
}

interface VendorCatalogResult {
  items: VendorDish[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  loadMore: () => void;
}

/** Loads ALL dishes assigned to the branch (up to 999). Suitable for display + client-side search/filter. */
export const useManagerBranchDishList = (): BranchDishListResult => {
  const branchId = useSelector(selectManagerBranchId);

  const query = useQuery({
    queryKey: queryKeys.managerDishes.branchList(branchId ?? 0),
    queryFn: () =>
      axiosApi.managerDishApi.getBranchDishes(branchId ?? 0, {
        pageNumber: 1,
        pageSize: 999,
      }),
    staleTime: 0,
    enabled: (branchId ?? 0) > 0,
  });

  const dishes = useMemo<VendorDish[]>(
    () => query.data?.items ?? [],
    [query.data]
  );
  const assignedIdSet = useMemo(
    () => new Set(dishes.map((d) => d.dishId)),
    [dishes]
  );

  return {
    dishes,
    assignedIdSet,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refresh: () => void query.refetch(),
  };
};

export const useVendorDishCatalog = (): VendorCatalogResult => {
  const vendorId = useSelector(selectManagerVendorId);

  const query = useInfiniteQuery({
    queryKey: queryKeys.managerDishes.vendorCatalog(vendorId ?? 0),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      axiosApi.managerDishApi.getVendorDishes(vendorId ?? 0, {
        pageNumber: pageParam,
        pageSize: 30,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000,
    enabled: (vendorId ?? 0) > 0,
  });

  const items = useMemo<VendorDish[]>(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data]
  );

  return {
    items,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    hasNext: query.hasNextPage ?? false,
    loadMore: () => void query.fetchNextPage(),
  };
};

export const useAssignDishes = (): UseMutationResult<void, Error, number[]> => {
  const branchId = useSelector(selectManagerBranchId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dishIds: number[]) =>
      axiosApi.managerDishApi.assignDishes(branchId ?? 0, dishIds),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerDishes.all,
      }),
  });
};

export const useUnassignDishes = (): UseMutationResult<
  void,
  Error,
  number[]
> => {
  const branchId = useSelector(selectManagerBranchId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dishIds: number[]) =>
      axiosApi.managerDishApi.unassignDishes(branchId ?? 0, dishIds),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerDishes.all,
      }),
  });
};

export const useUpdateDishAvailability = (): UseMutationResult<
  void,
  Error,
  { dishId: number; isSoldOut: boolean }
> => {
  const branchId = useSelector(selectManagerBranchId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dishId,
      isSoldOut,
    }: {
      dishId: number;
      isSoldOut: boolean;
    }) =>
      axiosApi.managerDishApi.updateDishAvailability(
        dishId,
        branchId ?? 0,
        isSoldOut
      ),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerDishes.all,
      }),
  });
};
