import {
  ORDER_STATUS,
  type OrderResponse,
} from '@features/customer/direct-ordering/api/cartApi';
import { useOrderQuery } from '@features/customer/direct-ordering/hooks/useOrderQuery';
import { queryKeys } from '@lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export const useOrderStatus = (
  orderId: number
): { order: OrderResponse | null } => {
  const { order } = useOrderQuery(orderId);
  const queryClient = useQueryClient();
  const didInvalidateRef = useRef(false);

  useEffect(() => {
    if (
      !didInvalidateRef.current &&
      (order?.status === ORDER_STATUS.Cancelled ||
        order?.status === ORDER_STATUS.Expired)
    ) {
      didInvalidateRef.current = true;
      void queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.all });
    }
  }, [order?.status, queryClient]);

  return { order };
};
