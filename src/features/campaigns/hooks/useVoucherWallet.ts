import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addVoucher,
  fetchMyVouchers,
  selectActiveVouchers,
  selectExpiredVouchers,
  selectRestaurantVouchers,
  selectSystemVouchers,
  selectVouchersError,
  selectVouchersLoading,
  type Voucher,
} from '@slices/campaigns';
import { useCallback, useEffect } from 'react';

export type VoucherTab = 'all' | 'system' | 'restaurant' | 'history';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useVoucherWallet = () => {
  const dispatch = useAppDispatch();
  const activeVouchers = useAppSelector(selectActiveVouchers);
  const expiredVouchers = useAppSelector(selectExpiredVouchers);
  const systemVouchers = useAppSelector(selectSystemVouchers);
  const restaurantVouchers = useAppSelector(selectRestaurantVouchers);
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
        case 'system':
          return systemVouchers;
        case 'restaurant':
          return restaurantVouchers;
        case 'history':
          return expiredVouchers;
        default:
          return activeVouchers;
      }
    },
    [activeVouchers, expiredVouchers, systemVouchers, restaurantVouchers]
  );

  const tabCount = useCallback(
    (tab: VoucherTab): number => {
      switch (tab) {
        case 'system':
          return systemVouchers.length;
        case 'restaurant':
          return restaurantVouchers.length;
        case 'history':
          return expiredVouchers.length;
        default:
          return activeVouchers.length;
      }
    },
    [activeVouchers, expiredVouchers, systemVouchers, restaurantVouchers]
  );

  return {
    activeVouchers,
    expiredVouchers,
    systemVouchers,
    restaurantVouchers,
    isLoading,
    error,
    handleRefresh,
    handleClaimVoucher,
    getDisplayedVouchers,
    tabCount,
  };
};
