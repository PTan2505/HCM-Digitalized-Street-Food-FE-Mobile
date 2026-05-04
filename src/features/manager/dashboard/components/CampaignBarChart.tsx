import type {
  CampaignBranchStat,
  CampaignStat,
} from '@manager/dashboard/api/managerDashboardApi';
import { CampaignBranchesModal } from '@manager/dashboard/components/CampaignBranchesModal';
import { ChevronRight, Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

interface Props {
  data: CampaignStat[];
}

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
const OTHERS_COLOR = '#9CA3AF';

const truncate = (text: string, max: number): string =>
  text.length > max ? text.substring(0, max) + '…' : text;

const abbrev = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
};

export const CampaignBarChart = ({ data }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 32 - 24, 280);

  const [selected, setSelected] = useState<CampaignStat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.revenue - a.revenue),
    [data]
  );

  const filteredCampaigns = useMemo(
    () =>
      sorted.filter((c) =>
        c.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [sorted, searchQuery]
  );

  const chartData = useMemo(() => {
    const collapsed: Array<{ campaign: CampaignStat; index: number }> =
      sorted.length > 5
        ? ((): Array<{ campaign: CampaignStat; index: number }> => {
            const top = sorted.slice(0, 5).map((c, i) => ({ campaign: c, index: i }));
            const rest = sorted.slice(5);
            const branchMap = new Map<number, CampaignBranchStat>();
            for (const c of rest) {
              for (const b of c.branches ?? []) {
                const existing = branchMap.get(b.branchId);
                if (existing) {
                  branchMap.set(b.branchId, {
                    ...existing,
                    revenue: existing.revenue + b.revenue,
                    orderCount: existing.orderCount + b.orderCount,
                  });
                } else {
                  branchMap.set(b.branchId, { ...b });
                }
              }
            }
            const others: CampaignStat = {
              campaignId: -1,
              campaignName: t('manager_dashboard.others'),
              revenue: rest.reduce((acc, c) => acc + c.revenue, 0),
              orderCount: rest.reduce((acc, c) => acc + c.orderCount, 0),
              branches: Array.from(branchMap.values()),
            };
            return [...top, { campaign: others, index: 5 }];
          })()
        : sorted.map((c, i) => ({ campaign: c, index: i }));

    const maxLen = collapsed.length <= 3 ? 14 : collapsed.length <= 5 ? 9 : 7;

    return collapsed.map((entry) => ({
      value: entry.campaign.revenue,
      label: truncate(entry.campaign.campaignName, maxLen),
      frontColor: COLORS[entry.index % COLORS.length],
    }));
  }, [sorted, t]);

  const maxValue = useMemo(() => {
    const max = chartData.reduce((acc, d) => Math.max(acc, d.value), 0);
    if (max === 0) return 1000;
    const padded = max * 1.2;
    const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
    return Math.ceil(padded / magnitude) * magnitude;
  }, [chartData]);

  return (
    <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="mb-3">
        <Text className="text-base font-bold text-gray-900">
          {t('manager_dashboard.campaigns_chart_title')}
        </Text>
        <Text className="text-xs text-gray-500">
          {t('manager_dashboard.campaigns_chart_subtitle')}
        </Text>
      </View>
      {chartData.length === 0 ? (
        <View className="h-48 items-center justify-center">
          <Text className="mb-1 text-2xl">📊</Text>
          <Text className="text-sm text-gray-400">
            {t('manager_dashboard.no_campaign_data')}
          </Text>
        </View>
      ) : (
        <>
          <BarChart
            data={chartData}
            width={chartWidth}
            height={200}
            barWidth={Math.min(
              36,
              Math.max(
                18,
                Math.floor((chartWidth - 80) / chartData.length / 1.7)
              )
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
            formatYLabel={(label: string) => abbrev(Number(label))}
            isAnimated
            animationDuration={900}
          />
          {sorted.length > 0 && (
            <View className="mt-4 gap-2">
              <Text className="text-xs font-semibold text-gray-700">
                {t('manager_dashboard.campaign_list_title')}
              </Text>
              <View className="flex-row items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                <Search size={14} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('manager_dashboard.campaign_search_placeholder')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-sm text-gray-800"
                />
              </View>
              {filteredCampaigns.length === 0 ? (
                <Text className="py-3 text-center text-xs text-gray-500">
                  {t('manager_dashboard.no_campaign_match')}
                </Text>
              ) : (
                filteredCampaigns.map((c) => {
                  const originalIdx = sorted.findIndex(
                    (s) => s.campaignId === c.campaignId
                  );
                  const dotColor =
                    originalIdx < 5
                      ? COLORS[originalIdx % COLORS.length]
                      : OTHERS_COLOR;
                  return (
                    <TouchableOpacity
                      key={c.campaignId}
                      onPress={() => setSelected(c)}
                      className="flex-row items-center justify-between rounded-lg bg-gray-50 p-2.5"
                    >
                      <View className="flex-1 flex-row items-center gap-2">
                        <View
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: dotColor }}
                        />
                        <Text
                          className="flex-1 text-sm text-gray-800"
                          numberOfLines={1}
                        >
                          {c.campaignName}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-xs font-semibold text-primary-dark">
                          {t('manager_dashboard.details')}
                        </Text>
                        <ChevronRight size={14} color="#06AA4C" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </>
      )}
      {selected && (
        <CampaignBranchesModal
          visible={!!selected}
          onClose={() => setSelected(null)}
          campaignName={selected.campaignName}
          branches={selected.branches ?? []}
        />
      )}
    </View>
  );
};
