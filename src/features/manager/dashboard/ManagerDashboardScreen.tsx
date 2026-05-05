import Header from '@components/Header';
import { CampaignBarChart } from '@manager/dashboard/components/CampaignBarChart';
import { DateRangeFilter } from '@manager/dashboard/components/DateRangeFilter';
import { DishBarChart } from '@manager/dashboard/components/DishBarChart';
import { RevenueLineChart } from '@manager/dashboard/components/RevenueLineChart';
import { SummaryCard } from '@manager/dashboard/components/SummaryCard';
import { VoucherBarChart } from '@manager/dashboard/components/VoucherBarChart';
import {
  buildDateRange,
  useCampaignStats,
  useRevenueSummary,
  useTopDishes,
  useVoucherStats,
  type DashboardPreset,
} from '@manager/dashboard/hooks/useManagerDashboard';
import {
  DollarSign,
  Megaphone,
  ShoppingBag,
  ShoppingCart,
  Target,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const DEFAULT_PRESET: DashboardPreset = 30;

export const ManagerDashboardScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<DashboardPreset | null>(DEFAULT_PRESET);
  const [range, setRange] = useState(() => buildDateRange(DEFAULT_PRESET));

  const handlePresetChange = (next: DashboardPreset): void => {
    setPreset(next);
    setRange(buildDateRange(next));
  };

  const handleRangeChange = (next: {
    fromDate: string;
    toDate: string;
  }): void => {
    setRange(next);
    setPreset(null);
  };

  const revenue = useRevenueSummary(range.fromDate, range.toDate);
  const topDishes = useTopDishes();
  const voucherStats = useVoucherStats();
  const campaignStats = useCampaignStats(range.fromDate, range.toDate);

  const isAnyLoading =
    revenue.isLoading ||
    topDishes.isLoading ||
    voucherStats.isLoading ||
    campaignStats.isLoading;

  const isAnyFetching =
    revenue.isFetching ||
    topDishes.isFetching ||
    voucherStats.isFetching ||
    campaignStats.isFetching;

  const isAnyError =
    revenue.isError ||
    topDishes.isError ||
    voucherStats.isError ||
    campaignStats.isError;

  const onRefresh = (): void => {
    void revenue.refetch();
    void topDishes.refetch();
    void voucherStats.refetch();
    void campaignStats.refetch();
  };

  const totalRevenue = revenue.data?.totalRevenue ?? 0;
  const totalOrders = revenue.data?.totalOrders ?? 0;
  const totalCampaigns = campaignStats.data?.totalCampaigns ?? 0;
  const totalCampaignRevenue = campaignStats.data?.totalCampaignRevenue ?? 0;
  const totalCampaignOrders = campaignStats.data?.totalCampaignOrders ?? 0;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header title={t('manager_dashboard.title')} />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isAnyFetching} onRefresh={onRefresh} />
        }
      >
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {t('manager_dashboard.heading')}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500">
            {t('manager_dashboard.heading_subtitle')}
          </Text>
        </View>

        <DateRangeFilter
          fromDate={range.fromDate}
          toDate={range.toDate}
          preset={preset}
          onChange={handleRangeChange}
          onPresetChange={handlePresetChange}
        />

        {isAnyLoading ? (
          <View className="h-48 items-center justify-center">
            <ActivityIndicator color="#9FD356" size="large" />
            <Text className="mt-2 text-xs text-gray-500">
              {t('manager_dashboard.loading')}
            </Text>
          </View>
        ) : (
          <>
            {isAnyError && (
              <View className="flex-row items-center justify-between rounded-xl border border-red-100 bg-red-50 p-3">
                <Text className="flex-1 text-xs text-red-600">
                  {t('manager_dashboard.partial_error')}
                </Text>
                <TouchableOpacity onPress={onRefresh}>
                  <Text className="text-xs font-semibold text-red-700">
                    {t('common.retry')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="flex-row flex-wrap gap-2">
              <SummaryCard
                title={t('manager_dashboard.total_revenue')}
                value={formatCurrency(totalRevenue)}
                Icon={DollarSign}
              />
              <SummaryCard
                title={t('manager_dashboard.total_orders')}
                value={totalOrders}
                Icon={ShoppingBag}
              />
              <SummaryCard
                title={t('manager_dashboard.total_campaigns')}
                value={totalCampaigns}
                Icon={Target}
              />
              <SummaryCard
                title={t('manager_dashboard.campaign_revenue')}
                value={formatCurrency(totalCampaignRevenue)}
                Icon={Megaphone}
              />
              <SummaryCard
                title={t('manager_dashboard.campaign_orders')}
                value={totalCampaignOrders}
                Icon={ShoppingCart}
              />
            </View>

            <RevenueLineChart data={revenue.data?.dailyRevenues ?? []} />
            <DishBarChart data={topDishes.data?.topDishes ?? []} />
            <CampaignBarChart data={campaignStats.data?.campaigns ?? []} />
            <VoucherBarChart data={voucherStats.data?.voucherUsages ?? []} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
