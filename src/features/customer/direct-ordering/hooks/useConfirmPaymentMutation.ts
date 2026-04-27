import type {
  ConfirmPaymentRequest,
  PaymentStatusResponse,
} from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useConfirmPaymentMutation = (): {
  confirmPayment: (
    data: ConfirmPaymentRequest
  ) => Promise<PaymentStatusResponse>;
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: ConfirmPaymentRequest) =>
      axiosApi.paymentApi.confirmOrderPayment(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
  return { confirmPayment: mutateAsync, isLoading: isPending };
};
