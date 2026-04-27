import type {
  OrderResponse,
  OrderStatus,
  PaginatedOrders,
} from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

const PAGE_SIZE = 10;

interface OrderHistoryResult {
  orders: OrderResponse[];
  totalCount: number;
  hasNext: boolean;
  currentPage: number;
  isLoading: boolean;
  loadMore: () => void;
  refetch: () => Promise<unknown>;
}

export const useOrderHistoryQuery = (
  status?: OrderStatus | null
): OrderHistoryResult => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const statusKey = status != null ? String(status) : undefined;

  const { data, isLoading, refetch } = useQuery({
    queryKey: [...queryKeys.orders.history(statusKey), page],
    queryFn: async (): Promise<
      PaginatedOrders & { accumulatedItems: OrderResponse[] }
    > => {
      const res = await axiosApi.orderApi.getMyOrders(
        page,
        PAGE_SIZE,
        status ?? undefined
      );
      const fresh = res.data;

      if (page === 1) return { ...fresh, accumulatedItems: fresh.items };

      const prev = queryClient.getQueryData<
        PaginatedOrders & { accumulatedItems: OrderResponse[] }
      >([...queryKeys.orders.history(statusKey), page - 1]);
      const existingById = new Map(
        (prev?.accumulatedItems ?? []).map((item) => [item.orderId, item])
      );
      fresh.items.forEach((item) => existingById.set(item.orderId, item));
      return { ...fresh, accumulatedItems: Array.from(existingById.values()) };
    },
    staleTime: 30 * 1000,
  });

  const loadMore = useCallback(() => {
    if (data?.hasNext) setPage((p) => p + 1);
  }, [data?.hasNext]);

  return {
    orders: data?.accumulatedItems ?? [],
    totalCount: data?.totalCount ?? 0,
    hasNext: data?.hasNext ?? false,
    currentPage: page,
    isLoading,
    loadMore,
    refetch,
  };
};
