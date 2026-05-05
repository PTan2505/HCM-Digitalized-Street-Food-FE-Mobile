import type { VoucherUsage } from '@manager/dashboard/api/managerDashboardApi';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  usages: VoucherUsage[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const VoucherStatsCard = ({
  usages,
  isLoading,
  isError,
  onRetry,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-3 text-base font-bold text-gray-900">
        {t('manager_dashboard.voucher_title')}
      </Text>
      {isLoading ? (
        <ActivityIndicator color="#9FD356" />
      ) : isError ? (
        <View className="items-center py-2">
          <Text className="mb-2 text-sm text-gray-400">
            {t('manager_dashboard.load_error')}
          </Text>
          <TouchableOpacity onPress={onRetry}>
            <Text className="text-sm font-semibold text-primary">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : !usages?.length ? (
        <Text className="py-2 text-center text-sm text-gray-400">
          {t('manager_dashboard.no_data')}
        </Text>
      ) : (
        usages.map((v, idx) => (
          <View
            key={idx}
            className="flex-row items-center justify-between border-b border-gray-50 py-2 last:border-0"
          >
            <Text
              className="max-w-[200px] text-sm text-gray-800"
              numberOfLines={1}
            >
              {v.voucherName}
            </Text>
            <Text className="text-sm font-semibold text-primary">
              {t('manager_dashboard.times_used', { count: v.usageCount })}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};
