import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { VendorBalanceHistoryItem } from '@manager/payment/types/payment';
import { useQuery } from '@tanstack/react-query';

interface UseVendorBalanceHistoryQueryResult {
  transactions: VendorBalanceHistoryItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const useVendorBalanceHistoryQuery =
  (): UseVendorBalanceHistoryQueryResult => {
    const { data, isLoading, isError, refetch } = useQuery<
      VendorBalanceHistoryItem[]
    >({
      queryKey: queryKeys.vendorBalanceHistory.all,
      queryFn: async (): Promise<VendorBalanceHistoryItem[]> => {
        const result = await axiosApi.managerPaymentApi.getVendorBalanceHistory();
        return result.data;
      },
    });

    return {
      transactions: data ?? [],
      isLoading,
      isError,
      refetch,
    };
  };
