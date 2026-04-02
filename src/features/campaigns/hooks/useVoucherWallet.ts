import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addVoucher,
  fetchMyVouchers,
  selectActiveVouchers,
  selectCampaignVouchers,
  selectSystemVouchers,
  selectVouchersError,
  selectVouchersLoading,
  type Voucher,
} from '@slices/campaigns';
import { useCallback, useEffect } from 'react';

export type VoucherTab = 'all' | 'campaign' | 'system' | 'restaurant';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useVoucherWallet = () => {
  const dispatch = useAppDispatch();
  const activeVouchers = useAppSelector(selectActiveVouchers);
  const campaignVouchers = useAppSelector(selectCampaignVouchers);
  const systemVouchers = useAppSelector(selectSystemVouchers);
  const isLoading = useAppSelector(selectVouchersLoading);
  const error = useAppSelector(selectVouchersError);

  useEffect(() => {
    void dispatch(fetchMyVouchers());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    void dispatch(fetchMyVouchers());
  }, [dispatch]);

  const handleClaimVoucher = useCallback(
    (voucher: Voucher) => {
      dispatch(addVoucher(voucher));
    },
    [dispatch]
  );

  const getDisplayedVouchers = useCallback(
    (tab: VoucherTab) => {
      switch (tab) {
        case 'campaign':
          return campaignVouchers;
        case 'system':
          return systemVouchers;
        case 'restaurant':
          return campaignVouchers;
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
        case 'restaurant':
          return campaignVouchers.length;
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
