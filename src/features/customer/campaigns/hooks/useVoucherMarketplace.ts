import type { VoucherDto } from '@features/customer/campaigns/api/voucherApi';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { refreshUserPointsThunk, selectUser } from '@slices/auth';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RedeemState {
  voucherId: number | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useVoucherMarketplace = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemState, setRedeemState] = useState<RedeemState>({
    voucherId: null,
    loading: false,
    error: null,
    success: false,
  });

  const fetchMarketplace = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await axiosApi.voucherApi.getMarketplaceVouchers();
      setVouchers(data);
    } catch {
      setError(t('marketplace.error_load'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchMarketplace();
  }, [fetchMarketplace]);

  const handleRedeem = useCallback(
    async (voucherId: number) => {
      setRedeemState({ voucherId, loading: true, error: null, success: false });
      try {
        await axiosApi.voucherApi.claimVoucher(voucherId);
        setRedeemState({
          voucherId,
          loading: false,
          error: null,
          success: true,
        });
        // Refresh list so remaining quantity updates
        void fetchMarketplace();
        void dispatch(refreshUserPointsThunk());
      } catch {
        setRedeemState({
          voucherId,
          loading: false,
          error: t('marketplace.error_redeem'),
          success: false,
        });
      }
    },
    [dispatch, fetchMarketplace, t]
  );

  const clearRedeemState = useCallback(() => {
    setRedeemState({
      voucherId: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    vouchers,
    isLoading,
    error,
    userPoints: user?.point ?? 0,
    redeemState,
    handleRedeem,
    clearRedeemState,
    handleRefresh: fetchMarketplace,
  };
};
