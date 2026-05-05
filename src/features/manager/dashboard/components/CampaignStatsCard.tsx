import type { CampaignStats } from '@manager/dashboard/api/managerDashboardApi';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const formatVnd = (amount: number): string =>
  amount.toLocaleString('vi-VN') + 'đ';

export const CampaignStatsCard = ({
  data,
  isLoading,
  isError,
}: {
  data: CampaignStats | undefined;
  isLoading: boolean;
  isError: boolean;
}): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-3 text-base font-bold text-gray-900">
        {t('manager_dashboard.campaigns_title')}
      </Text>
      {isLoading ? (
        <ActivityIndicator size="small" color="#9FD356" />
      ) : isError || !data ? (
        <Text className="text-sm text-gray-400">
          {t('manager_dashboard.error_load')}
        </Text>
      ) : (
        <>
          <View className="mb-3 flex-row gap-4">
            <View className="flex-1 rounded-xl bg-gray-50 p-3">
              <Text className="text-xs text-gray-500">
                {t('manager_dashboard.total_campaigns')}
              </Text>
              <Text className="mt-1 text-lg font-bold text-gray-900">
                {data.totalCampaigns}
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-gray-50 p-3">
              <Text className="text-xs text-gray-500">
                {t('manager_dashboard.campaign_orders')}
              </Text>
              <Text className="mt-1 text-lg font-bold text-gray-900">
                {data.totalCampaignOrders}
              </Text>
            </View>
          </View>
          <View className="rounded-xl bg-primary/10 p-3">
            <Text className="text-xs text-gray-500">
              {t('manager_dashboard.campaign_revenue')}
            </Text>
            <Text className="mt-1 text-lg font-bold text-primary-dark">
              {formatVnd(data.totalCampaignRevenue)}
            </Text>
          </View>
          {data.campaigns.length > 0 && (
            <View className="mt-3 gap-2">
              {data.campaigns.map((c) => (
                <View
                  key={c.campaignId}
                  className="flex-row items-center justify-between border-t border-gray-100 pt-2"
                >
                  <Text
                    className="flex-1 pr-2 text-sm text-gray-700"
                    numberOfLines={1}
                  >
                    {c.campaignName}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {formatVnd(c.revenue)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};
