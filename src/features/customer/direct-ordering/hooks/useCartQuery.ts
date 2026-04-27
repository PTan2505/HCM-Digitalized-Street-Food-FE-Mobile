import type { CartResponse } from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useCartQuery = (
  branchId: number
): { cart: CartResponse | null; isLoading: boolean; refetch: () => void } => {
  const {
    data: cart = null,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.cart.byBranch(branchId),
    queryFn: () =>
      axiosApi.cartApi.getMyCartByBranch(branchId).then((r) => r.data),
    staleTime: 30 * 1000,
    enabled: branchId > 0,
  });

  return { cart, isLoading, refetch };
};
