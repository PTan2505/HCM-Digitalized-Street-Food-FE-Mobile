import type { Voucher } from '@features/customer/campaigns/types/voucher';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

const getExpiresAt = (v: Voucher): Date => new Date(v.endDate ?? '9999-12-31');

export const useMyVouchersQuery = (): {
  vouchers: Voucher[];
  activeVouchers: Voucher[];
  campaignVouchers: Voucher[];
  systemVouchers: Voucher[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  invalidate: () => void;
} => {
  const queryClient = useQueryClient();

  const {
    data: vouchers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.vouchers.myVouchers,
    queryFn: () => axiosApi.voucherApi.getMyVouchers(),
    staleTime: 2 * 60 * 1000,
  });

  const activeVouchers = useMemo(
    () => vouchers.filter((v) => getExpiresAt(v) > new Date() && v.isAvailable),
    [vouchers]
  );

  const campaignVouchers = useMemo(
    () => activeVouchers.filter((v) => v.campaignId != null),
    [activeVouchers]
  );

  const systemVouchers = useMemo(
    () => activeVouchers.filter((v) => v.campaignId == null),
    [activeVouchers]
  );

  const invalidate = (): void => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.vouchers.myVouchers,
    });
  };

  return {
    vouchers,
    activeVouchers,
    campaignVouchers,
    systemVouchers,
    isLoading,
    error,
    refetch,
    invalidate,
  };
};
