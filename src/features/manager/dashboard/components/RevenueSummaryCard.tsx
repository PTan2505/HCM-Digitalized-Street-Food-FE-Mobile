import type { RevenueSummary } from '@manager/dashboard/api/managerDashboardApi';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  data: RevenueSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);

export const RevenueSummaryCard = ({
  data,
  isLoading,
  isError,
  onRetry,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="rounded-2xl bg-primary p-4">
      <Text className="mb-3 text-sm font-semibold text-white/80">
        {t('manager_dashboard.revenue_title')}
      </Text>
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : isError ? (
        <View className="items-center">
          <Text className="mb-2 text-sm text-white/70">
            {t('manager_dashboard.load_error')}
          </Text>
          <TouchableOpacity
            onPress={onRetry}
            className="rounded-full bg-white/20 px-4 py-1"
          >
            <Text className="text-xs font-semibold text-white">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">
              {formatCurrency(data?.totalRevenue ?? 0)}
            </Text>
            <Text className="mt-0.5 text-xs text-white/70">
              {t('manager_dashboard.total_revenue')}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-white">
              {data?.totalOrders ?? 0}
            </Text>
            <Text className="mt-0.5 text-xs text-white/70">
              {t('manager_dashboard.total_orders')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
