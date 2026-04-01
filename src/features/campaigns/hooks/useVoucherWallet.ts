import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addVoucher,
  fetchMyVouchers,
  selectActiveVouchers,
  selectExpiredVouchers,
  selectRestaurantVouchers,
  selectSystemVouchers,
  selectVouchers,
  selectVouchersError,
  selectVouchersLoading,
  type Voucher,
} from '@slices/campaigns';
import { useCallback, useEffect, useState } from 'react';

export type VoucherTab = 'all' | 'system' | 'restaurant';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useVoucherWallet = () => {
  const dispatch = useAppDispatch();
  const vouchers = useAppSelector(selectVouchers);
  const activeVouchers = useAppSelector(selectActiveVouchers);
  const expiredVouchers = useAppSelector(selectExpiredVouchers);
  const systemVouchers = useAppSelector(selectSystemVouchers);
  const restaurantVouchers = useAppSelector(selectRestaurantVouchers);
  const isLoading = useAppSelector(selectVouchersLoading);
  const error = useAppSelector(selectVouchersError);

  const [activeTab, setActiveTab] = useState<VoucherTab>('all');
  const [showHistory, setShowHistory] = useState(false);

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

  const displayedVouchers = showHistory
    ? expiredVouchers
    : activeTab === 'system'
      ? systemVouchers
      : activeTab === 'restaurant'
        ? restaurantVouchers
        : activeVouchers;

  return {
    vouchers,
    activeVouchers,
    expiredVouchers,
    systemVouchers,
    restaurantVouchers,
    displayedVouchers,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    showHistory,
    setShowHistory,
    handleRefresh,
    handleClaimVoucher,
  };
};
