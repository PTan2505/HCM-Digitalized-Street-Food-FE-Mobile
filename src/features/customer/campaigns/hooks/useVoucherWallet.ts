import { useMyVouchersQuery } from '@features/customer/campaigns/hooks/useMyVouchersQuery';
import type { Voucher } from '@features/customer/campaigns/types/voucher';
import { useCallback } from 'react';

export type VoucherTab = 'all' | 'campaign' | 'system' | 'restaurant';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useVoucherWallet = () => {
  const {
    activeVouchers,
    campaignVouchers,
    systemVouchers,
    isLoading,
    error,
    refetch: handleRefresh,
    invalidate,
  } = useMyVouchersQuery();

  const handleClaimVoucher = useCallback(
    (_voucher: Voucher) => {
      invalidate();
    },
    [invalidate]
  );

  const getDisplayedVouchers = useCallback(
    (tab: VoucherTab) => {
      switch (tab) {
        case 'campaign':
          return campaignVouchers;
        case 'system':
          return systemVouchers;
        default:
          return activeVouchers;
      }
    },
    [activeVouchers, campaignVouchers, systemVouchers]
  );

  const tabCount = useCallback(
    (tab: VoucherTab): number => {
      switch (tab) {
        case 'campaign':
          return campaignVouchers.length;
        case 'system':
          return systemVouchers.length;
        default:
          return activeVouchers.length;
      }
    },
    [activeVouchers, campaignVouchers, systemVouchers]
  );

  return {
    activeVouchers,
    campaignVouchers,
    systemVouchers,
    isLoading,
    error,
    handleRefresh,
    handleClaimVoucher,
    getDisplayedVouchers,
    tabCount,
  };
};
