import Header from '@components/Header';
import { CampaignStatsCard } from '@manager/dashboard/components/CampaignStatsCard';
import { DateRangeChips } from '@manager/dashboard/components/DateRangeChips';
import { RevenueSummaryCard } from '@manager/dashboard/components/RevenueSummaryCard';
import { TopDishesCard } from '@manager/dashboard/components/TopDishesCard';
import { VoucherStatsCard } from '@manager/dashboard/components/VoucherStatsCard';
import type { DashboardPreset } from '@manager/dashboard/hooks/useManagerDashboard';
import {
  useCampaignStats,
  useDateRange,
  useRevenueSummary,
  useTopDishes,
  useVoucherStats,
} from '@manager/dashboard/hooks/useManagerDashboard';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export const ManagerDashboardScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<DashboardPreset>(30);
  const { fromDate, toDate } = useDateRange(preset);

  const revenue = useRevenueSummary(fromDate, toDate);
  const topDishes = useTopDishes();
  const voucherStats = useVoucherStats();
  const campaignStats = useCampaignStats(fromDate, toDate);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header title={t('manager_dashboard.title')} />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <DateRangeChips selected={preset} onSelect={setPreset} />

        <RevenueSummaryCard
          data={revenue.data}
          isLoading={revenue.isLoading}
          isError={revenue.isError}
          onRetry={() => void revenue.refetch()}
        />

        <TopDishesCard
          dishes={topDishes.data?.topDishes}
          isLoading={topDishes.isLoading}
          isError={topDishes.isError}
          onRetry={() => void topDishes.refetch()}
        />

        <VoucherStatsCard
          usages={voucherStats.data?.voucherUsages}
          isLoading={voucherStats.isLoading}
          isError={voucherStats.isError}
          onRetry={() => void voucherStats.refetch()}
        />

        <CampaignStatsCard
          data={campaignStats.data}
          isLoading={campaignStats.isLoading}
          isError={campaignStats.isError}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
