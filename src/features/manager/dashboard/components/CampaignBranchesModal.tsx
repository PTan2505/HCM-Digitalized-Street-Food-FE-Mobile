import type { CampaignBranchStat } from '@manager/dashboard/api/managerDashboardApi';
import { X } from 'lucide-react-native';
import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
  campaignName: string;
  branches: CampaignBranchStat[];
}

const formatVnd = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);

export const CampaignBranchesModal = ({
  visible,
  onClose,
  campaignName,
  branches,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const sorted = [...branches].sort((a, b) => b.revenue - a.revenue);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <View className="flex-1 pr-3">
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {campaignName}
            </Text>
            <Text className="text-xs text-gray-500">
              {t('manager_dashboard.campaign_branches_subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="rounded-full bg-gray-100 p-2"
          >
            <X size={18} color="#374151" />
          </TouchableOpacity>
        </View>
        {sorted.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-gray-500">
              {t('manager_dashboard.no_branch_data')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={sorted}
            keyExtractor={(item) => String(item.branchId)}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-sm font-semibold text-gray-900"
                    numberOfLines={1}
                  >
                    {item.branchName}
                  </Text>
                  <Text className="mt-0.5 text-xs text-gray-500">
                    {t('manager_dashboard.orders_count', {
                      count: item.orderCount,
                    })}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-primary-dark">
                  {formatVnd(item.revenue)}
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};
