import type {
  CompleteOrderRequest,
  DecideOrderRequest,
  ManagerOrderDetail,
  ManagerOrderDetailNullable,
  ManagerOrderSummary,
  PaginatedManagerOrders,
} from '@features/manager/orders/api/managerOrderApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

const ORDER_STALE_TIME = 0;

interface ManagerOrdersListResult {
  items: ManagerOrderSummary[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export const useManagerOrdersList = (
  status: number
): ManagerOrdersListResult => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.managerOrders.list(status),
    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<PaginatedManagerOrders> =>
      axiosApi.managerOrderApi.getManagerOrders(pageParam, 10, status),
    getNextPageParam: (lastPage: PaginatedManagerOrders) =>
      lastPage.hasNext === true ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    staleTime: ORDER_STALE_TIME,
  });

  const items: ManagerOrderSummary[] =
    query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    items,
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

export const useManagerStatusCounts = (
  statuses: readonly number[]
): Partial<Record<number, number>> => {
  const results = useQueries({
    queries: statuses.map((status) => ({
      queryKey: queryKeys.managerOrders.count(status),
      queryFn: (): Promise<PaginatedManagerOrders> =>
        axiosApi.managerOrderApi.getManagerOrders(1, 1, status),
      select: (data: PaginatedManagerOrders): number => data.totalCount,
      staleTime: 30_000,
    })),
  });

  const statusCounts: Partial<Record<number, number>> = {};
  statuses.forEach((status, i) => {
    const count = results[i]?.data;
    if (count !== undefined) {
      statusCounts[status] = count;
    }
  });
  return statusCounts;
};

interface ManagerOrderDetailResult {
  order: ManagerOrderDetailNullable;
  isLoading: boolean;
}

export const useManagerOrderDetail = (
  orderId: number
): ManagerOrderDetailResult => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.managerOrders.detail(orderId),
    queryFn: (): Promise<ManagerOrderDetail> =>
      axiosApi.managerOrderApi.getOrderDetail(orderId),
    staleTime: ORDER_STALE_TIME,
    enabled: orderId > 0,
  });
  return { order: data ?? null, isLoading };
};

export const useDecideManagerOrder = (): UseMutationResult<
  void,
  Error,
  { orderId: number; data: DecideOrderRequest }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: number;
      data: DecideOrderRequest;
    }): Promise<void> => axiosApi.managerOrderApi.decideOrder(orderId, data),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerOrders.all,
      });
    },
  });
};

export const useCompleteManagerOrder = (): UseMutationResult<
  void,
  Error,
  { orderId: number; data: CompleteOrderRequest }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: number;
      data: CompleteOrderRequest;
    }): Promise<void> => axiosApi.managerOrderApi.completeOrder(orderId, data),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerOrders.all,
      });
    },
  });
};

export const useVendorOrdersList = (
  status: number,
  branchId?: number
): ManagerOrdersListResult => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.managerOrders.vendorList(status, branchId),
    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<PaginatedManagerOrders> =>
      axiosApi.managerOrderApi.getVendorOrders(pageParam, 10, status, branchId),
    getNextPageParam: (lastPage: PaginatedManagerOrders) =>
      lastPage.hasNext === true ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    staleTime: ORDER_STALE_TIME,
  });

  const items: ManagerOrderSummary[] =
    query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    items,
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
