import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { PaymentTransaction } from '@user/types/payment';
import { useQuery } from '@tanstack/react-query';

interface UsePaymentHistoryQueryResult {
  transactions: PaymentTransaction[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const usePaymentHistoryQuery = (): UsePaymentHistoryQueryResult => {
  const { data, isLoading, isError, refetch } = useQuery<PaymentTransaction[]>({
    queryKey: queryKeys.paymentHistory.all,
    queryFn: async (): Promise<PaymentTransaction[]> => {
      const result = await axiosApi.userPaymentApi.getPaymentHistory();
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
