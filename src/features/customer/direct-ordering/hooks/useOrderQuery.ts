import type { OrderResponse } from '@features/customer/direct-ordering/api/cartApi';
import { ORDER_STATUS } from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const TERMINAL_STATUSES = [ORDER_STATUS.Complete, ORDER_STATUS.Cancelled];
const POLL_INTERVAL = 10_000;

export const useOrderQuery = (
  orderId: number
): { order: OrderResponse | null; isLoading: boolean } => {
  const { data: order = null, isLoading } = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => axiosApi.orderApi.getOrderById(orderId).then((r) => r.data),
    enabled: orderId > 0,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        status !== undefined &&
        (TERMINAL_STATUSES as number[]).includes(status)
      )
        return false;
      return POLL_INTERVAL;
    },
  });

  return { order, isLoading };
};

export const useInvalidateOrder = (): ((orderId: number) => void) => {
  const queryClient = useQueryClient();
  return (orderId: number) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.orders.detail(orderId),
    });
  };
};
