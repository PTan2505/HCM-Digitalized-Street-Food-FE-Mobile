import type { OrderResponse } from '@features/customer/direct-ordering/api/cartApi';
import { useOrderQuery } from '@features/customer/direct-ordering/hooks/useOrderQuery';

export const useOrderStatus = (
  orderId: number
): { order: OrderResponse | null } => {
  const { order } = useOrderQuery(orderId);
  return { order };
};
