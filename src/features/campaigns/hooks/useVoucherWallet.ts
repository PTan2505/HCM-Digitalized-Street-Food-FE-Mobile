import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addVoucher,
  selectActiveVouchers,
  selectExpiredVouchers,
  selectVouchers,
  type Voucher,
} from '@slices/campaigns';
import { useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useVoucherWallet = () => {
  const dispatch = useAppDispatch();
  const vouchers = useAppSelector(selectVouchers);
  const activeVouchers = useAppSelector(selectActiveVouchers);
  const expiredVouchers = useAppSelector(selectExpiredVouchers);

  const handleClaimVoucher = useCallback(
    (voucher: Voucher) => {
      dispatch(addVoucher(voucher));
    },
    [dispatch]
  );

  return {
    vouchers,
    activeVouchers,
    expiredVouchers,
    handleClaimVoucher,
  };
};
