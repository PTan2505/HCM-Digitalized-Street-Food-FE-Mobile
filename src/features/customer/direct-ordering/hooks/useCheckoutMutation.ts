import type {
  CheckoutCartRequest,
  CheckoutCartResponse,
} from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCheckoutMutation = (): {
  checkout: (data: CheckoutCartRequest) => Promise<CheckoutCartResponse>;
  isLoading: boolean;
  error: Error | null;
} => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (data: CheckoutCartRequest) =>
      axiosApi.cartApi.checkout(data).then((r) => r.data),
    onSuccess: (_, { branchId, voucherId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cart.byBranch(branchId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.my });
      if (voucherId != null) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.vouchers.all,
        });
      }
    },
  });
  return { checkout: mutateAsync, isLoading: isPending, error };
};
