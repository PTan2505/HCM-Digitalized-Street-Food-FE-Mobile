import type { OrderResponse } from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCancelOrderMutation = (): {
  cancelOrder: (orderId: number) => Promise<OrderResponse>;
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (orderId: number) =>
      axiosApi.orderApi.cancelOrder(orderId).then((r) => r.data),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.orderId), order);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.history(),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.all });
    },
  });
  return { cancelOrder: mutateAsync, isLoading: isPending };
};
