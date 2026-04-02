import { useAppDispatch } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { updateMoneyBalance } from '@slices/auth';
import type { WithdrawRequest } from '@user/types/payment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export const useWithdraw = (): {
  requestWithdraw: (
    data: WithdrawRequest,
    onSuccess: () => void
  ) => Promise<void>;
  isLoading: boolean;
} => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const requestWithdraw = async (
    data: WithdrawRequest,
    onSuccess: () => void
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axiosApi.userPaymentApi.requestWithdraw(data);
      if (response.data?.currentVendorBalance !== undefined) {
        dispatch(updateMoneyBalance(response.data.currentVendorBalance));
      }
      Alert.alert(t('withdraw.success_title'), t('withdraw.success_message'), [
        { text: t('common.ok'), onPress: onSuccess },
      ]);
    } catch {
      Alert.alert(t('withdraw.error_title'), t('withdraw.error_message'));
    } finally {
      setIsLoading(false);
    }
  };

  return { requestWithdraw, isLoading };
};
