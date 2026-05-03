import Header from '@components/Header';
import { CampaignStatusBadge } from '@manager/campaigns/components/CampaignStatusBadge';
import { useVendorCampaignDetail } from '@manager/campaigns/hooks/useVendorCampaigns';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface RouteParams {
  campaignId: number;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const VendorCampaignDetailScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const route = useRoute();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { campaignId } = route.params as RouteParams;
  const {
    data: campaign,
    isLoading,
    isError,
    refetch,
  } = useVendorCampaignDetail(campaignId);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('manager_campaigns.detail_title')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={
          campaign
            ? {
                label: t('manager_campaigns.edit'),
                onPress: () =>
                  navigation.navigate('VendorEditCampaign', { campaignId }),
              }
            : undefined
        }
      />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : isError || !campaign ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('manager_dashboard.load_error')}
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-6 py-2"
            onPress={() => void refetch()}
          >
            <Text className="font-semibold text-white">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-3 flex-row items-start justify-between">
              <Text className="flex-1 pr-2 text-xl font-bold text-gray-900">
                {campaign.name}
              </Text>
              <CampaignStatusBadge isActive={campaign.isActive} />
            </View>
            {campaign.description ? (
              <Text className="mb-3 text-sm text-gray-600">
                {campaign.description}
              </Text>
            ) : null}
            <View className="rounded-xl bg-gray-50 p-3">
              <Text className="text-xs font-semibold uppercase text-gray-500">
                {t('manager_campaigns.date_range_label')}
              </Text>
              <Text className="mt-1 text-sm font-medium text-gray-800">
                {formatDate(campaign.startDate)} →{' '}
                {formatDate(campaign.endDate)}
              </Text>
            </View>
            {campaign.branchIds && campaign.branchIds.length > 0 && (
              <View className="mt-3 rounded-xl bg-gray-50 p-3">
                <Text className="text-xs font-semibold uppercase text-gray-500">
                  {t('manager_campaigns.branches_count')}
                </Text>
                <Text className="mt-1 text-sm font-medium text-gray-800">
                  {campaign.branchIds.length}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
