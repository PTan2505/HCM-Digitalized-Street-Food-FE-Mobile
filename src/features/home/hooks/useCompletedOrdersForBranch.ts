import {
  ORDER_STATUS,
  type OrderResponse,
} from '@features/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export interface CompletedOrdersResult {
  /** True when the user has at least one completed order at this branch */
  hasCompletedOrders: boolean;
  /** The orderId of the first (most-recently-placed) completed order, or null */
  firstOrderId: number | null;
  completedOrders: OrderResponse[];
  isLoading: boolean;
}

/**
 * Fetches the current user's completed orders filtered to a specific branch.
 *
 * WHY THIS EXISTS:
 * The backend allows order-based reviews (one per completed order) with no
 * velocity/distance restrictions.  When the user has completed orders at a
 * branch we must bypass the non-order eligibility checks and pass `orderId`
 * in the submit payload instead of coordinates.
 *
 * The list is cached for 5 minutes; after a successful review the caller
 * should invalidate `queryKeys.orders.completedByBranch(branchId)` to
 * refresh so the next order (if any) becomes the candidate.
 */
export const useCompletedOrdersForBranch = (
  branchId: number
): CompletedOrdersResult => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders.completedByBranch(branchId),
    queryFn: async (): Promise<OrderResponse[]> => {
      const res = await axiosApi.orderApi.getMyOrders(
        1,
        100,
        ORDER_STATUS.Complete
      );
      return res.data.items.filter((o) => o.branchId === branchId);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const completedOrders = data ?? [];
  return {
    hasCompletedOrders: completedOrders.length > 0,
    firstOrderId: completedOrders[0]?.orderId ?? null,
    completedOrders,
    isLoading,
  };
};
