import type { VoucherUsage } from '@manager/dashboard/api/managerDashboardApi';
import React, { useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

interface Props {
  data: VoucherUsage[];
}

const truncate = (text: string, max: number): string =>
  text.length > max ? text.substring(0, max) + '…' : text;

export const VoucherBarChart = ({ data }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 32 - 24, 280);

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.usageCount - a.usageCount);
    const collapsed =
      sorted.length > 5
        ? [
            ...sorted.slice(0, 5),
            {
              voucherType: 'AMOUNT',
              voucherName: t('manager_dashboard.others'),
              usageCount: sorted
                .slice(5)
                .reduce((acc, c) => acc + c.usageCount, 0),
            },
          ]
        : sorted;

    const maxLen = collapsed.length <= 3 ? 14 : collapsed.length <= 5 ? 9 : 7;

    return collapsed.map((v) => ({
      value: v.usageCount,
      label: truncate(v.voucherName, maxLen),
      frontColor: '#8B5CF6',
      topLabelComponent: (): React.JSX.Element => (
        <Text className="text-[10px] font-semibold text-gray-700">
          {v.usageCount}
        </Text>
      ),
    }));
  }, [data, t]);

  const maxValue = useMemo(() => {
    const max = chartData.reduce((acc, d) => Math.max(acc, d.value), 0);
    if (max === 0) return 10;
    const padded = max * 1.2;
    const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
    return Math.ceil(padded / magnitude) * magnitude;
  }, [chartData]);

  return (
    <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="mb-3">
        <Text className="text-base font-bold text-gray-900">
          {t('manager_dashboard.voucher_chart_title')}
        </Text>
        <Text className="text-xs text-gray-500">
          {t('manager_dashboard.voucher_chart_subtitle')}
        </Text>
      </View>
      {chartData.length === 0 ? (
        <View className="h-48 items-center justify-center">
          <Text className="mb-1 text-2xl">🎟️</Text>
          <Text className="text-sm text-gray-400">
            {t('manager_dashboard.no_voucher_data')}
          </Text>
        </View>
      ) : (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={200}
          barWidth={Math.min(
            36,
            Math.max(18, Math.floor((chartWidth - 80) / chartData.length / 1.7))
          )}
          spacing={Math.max(
            14,
            Math.floor((chartWidth - 80) / chartData.length / 2.2)
          )}
          initialSpacing={12}
          barBorderRadius={6}
          maxValue={maxValue}
          noOfSections={4}
          rulesType="dashed"
          rulesColor="#E5E7EB"
          yAxisColor="transparent"
          xAxisColor="#E5E7EB"
          xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
          yAxisTextStyle={{ color: '#6B7280', fontSize: 10 }}
          isAnimated
          animationDuration={900}
        />
      )}
    </View>
  );
};
