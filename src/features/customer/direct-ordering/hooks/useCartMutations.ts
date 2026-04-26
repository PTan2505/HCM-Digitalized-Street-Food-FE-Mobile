import type { CartResponse } from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const invalidateCartCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  branchId: number
): void => {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.cart.byBranch(branchId),
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.cart.my });
};

export const useAddCartItem = (): {
  addItem: (args: {
    dishId: number;
    quantity: number;
    branchId: number;
  }) => Promise<CartResponse>;
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (args: {
      dishId: number;
      quantity: number;
      branchId: number;
    }) => axiosApi.cartApi.addItem(args).then((r) => r.data),
    onSuccess: (_, { branchId }) => invalidateCartCaches(queryClient, branchId),
  });
  return { addItem: mutateAsync, isLoading: isPending };
};

export const useUpdateCartItem = (): {
  updateItem: (args: {
    dishId: number;
    quantity: number;
    branchId: number;
  }) => Promise<CartResponse>;
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      dishId,
      branchId,
      quantity,
    }: {
      dishId: number;
      quantity: number;
      branchId: number;
    }) =>
      axiosApi.cartApi
        .updateItemQuantity(dishId, branchId, { quantity })
        .then((r) => r.data),
    onSuccess: (_, { branchId }) => invalidateCartCaches(queryClient, branchId),
  });
  return { updateItem: mutateAsync, isLoading: isPending };
};

export const useRemoveCartItem = (): {
  removeItem: (args: {
    dishId: number;
    branchId: number;
  }) => Promise<CartResponse>;
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ dishId, branchId }: { dishId: number; branchId: number }) =>
      axiosApi.cartApi.removeItem(dishId, branchId).then((r) => r.data),
    onSuccess: (_, { branchId }) => invalidateCartCaches(queryClient, branchId),
  });
  return { removeItem: mutateAsync, isLoading: isPending };
};

export const useClearCart = (): {
  clearCart: (branchId: number) => Promise<void>;
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (branchId: number) =>
      axiosApi.cartApi.clearCart(branchId).then(() => undefined),
    onSuccess: (_, branchId) => invalidateCartCaches(queryClient, branchId),
  });
  return { clearCart: mutateAsync, isLoading: isPending };
};

export const useCartMutations = (): {
  addItem: (args: {
    dishId: number;
    quantity: number;
    branchId: number;
  }) => Promise<CartResponse>;
  updateItem: (args: {
    dishId: number;
    quantity: number;
    branchId: number;
  }) => Promise<CartResponse>;
  removeItem: (args: {
    dishId: number;
    branchId: number;
  }) => Promise<CartResponse>;
  clearCart: (branchId: number) => Promise<void>;
  isLoading: boolean;
} => {
  const { addItem, isLoading: addLoading } = useAddCartItem();
  const { updateItem, isLoading: updateLoading } = useUpdateCartItem();
  const { removeItem, isLoading: removeLoading } = useRemoveCartItem();
  const { clearCart, isLoading: clearLoading } = useClearCart();
  return {
    addItem,
    updateItem,
    removeItem,
    clearCart,
    isLoading: addLoading || updateLoading || removeLoading || clearLoading,
  };
};
