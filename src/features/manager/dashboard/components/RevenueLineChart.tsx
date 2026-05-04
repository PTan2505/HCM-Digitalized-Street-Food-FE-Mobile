import type { DailyRevenue } from '@manager/dashboard/api/managerDashboardApi';
import React, { useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

interface Props {
  data: DailyRevenue[];
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const abbrev = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
};

export const RevenueLineChart = ({ data }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  // Card padding 16 each side + chart container padding
  const chartWidth = Math.max(screenWidth - 32 - 24, 280);

  const chartData = useMemo(
    () =>
      data.map((d) => {
        const dt = new Date(d.date);
        return {
          value: d.revenue,
          label: `${dt.getDate()}/${dt.getMonth() + 1}`,
          dataPointText: '',
          customDataPoint: undefined,
          orderCount: d.orderCount,
          rawDate: dt,
        };
      }),
    [data]
  );

  const maxValue = useMemo(() => {
    const max = chartData.reduce((acc, d) => Math.max(acc, d.value), 0);
    if (max === 0) return 100;
    // Round up to a nice number for axis
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / magnitude) * magnitude;
  }, [chartData]);

  return (
    <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="mb-3">
        <Text className="text-base font-bold text-gray-900">
          {t('manager_dashboard.revenue_chart_title')}
        </Text>
        <Text className="text-xs text-gray-500">
          {t('manager_dashboard.revenue_chart_subtitle')}
        </Text>
      </View>
      {chartData.length === 0 ? (
        <View className="h-48 items-center justify-center">
          <Text className="mb-1 text-2xl">📊</Text>
          <Text className="text-sm text-gray-400">
            {t('manager_dashboard.no_data')}
          </Text>
        </View>
      ) : (
        <View>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            initialSpacing={12}
            spacing={Math.max(
              28,
              Math.floor((chartWidth - 60) / Math.max(chartData.length, 1))
            )}
            thickness={3}
            color="#3B82F6"
            startFillColor="#3B82F6"
            endFillColor="#3B82F6"
            startOpacity={0.25}
            endOpacity={0.02}
            areaChart
            curved
            hideRules={false}
            rulesType="dashed"
            rulesColor="#E5E7EB"
            yAxisColor="transparent"
            xAxisColor="#E5E7EB"
            xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
            yAxisTextStyle={{ color: '#6B7280', fontSize: 10 }}
            yAxisLabelWidth={42}
            formatYLabel={(label: string) => abbrev(Number(label))}
            maxValue={maxValue}
            noOfSections={4}
            dataPointsColor="#3B82F6"
            dataPointsRadius={3}
            isAnimated
            animationDuration={900}
            adjustToWidth
            pointerConfig={{
              pointerStripHeight: 200,
              pointerStripColor: '#3B82F6',
              pointerStripWidth: 1,
              pointerColor: '#2563EB',
              radius: 5,
              pointerLabelWidth: 160,
              pointerLabelHeight: 70,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (
                items: Array<{
                  value: number;
                  label: string;
                  orderCount?: number;
                }>
              ) => {
                const item = items[0];
                if (!item) return null;
                return (
                  <View className="rounded-lg border border-gray-100 bg-white p-2 shadow-md">
                    <Text className="mb-1 text-[11px] font-medium text-gray-500">
                      {item.label}
                    </Text>
                    <Text className="text-[12px] font-bold text-blue-600">
                      {formatCurrency(item.value)}
                    </Text>
                    <Text className="text-[11px] text-gray-600">
                      {t('manager_dashboard.orders_count', {
                        count: item.orderCount ?? 0,
                      })}
                    </Text>
                  </View>
                );
              },
            }}
          />
        </View>
      )}
    </View>
  );
};
