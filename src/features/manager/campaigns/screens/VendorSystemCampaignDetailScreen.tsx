import Header from '@components/Header';
import { CampaignStatusBadge } from '@manager/campaigns/components/CampaignStatusBadge';
import {
  useJoinSystemCampaign,
  useSystemCampaignDetail,
} from '@manager/campaigns/hooks/useSystemCampaigns';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export const VendorSystemCampaignDetailScreen = (): JSX.Element => {
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
  } = useSystemCampaignDetail(campaignId);
  const { data: vendorInfo } = useVendorInfo();
  const joinCampaign = useJoinSystemCampaign(campaignId);

  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  const branches = vendorInfo?.branches ?? [];
  const alreadyJoinedIds = campaign?.joinedBranchIds ?? [];

  const toggleBranch = (branchId: number): void => {
    setSelectedBranchIds((prev) =>
      prev.includes(branchId)
        ? prev.filter((id) => id !== branchId)
        : [...prev, branchId]
    );
  };

  const handleJoin = (): void => {
    if (selectedBranchIds.length === 0) {
      Alert.alert(t('manager_campaigns.join_no_branch'));
      return;
    }
    joinCampaign.mutate(
      { branchIds: selectedBranchIds },
      {
        onSuccess: () => {
          Alert.alert(t('manager_campaigns.join_success'));
          setSelectedBranchIds([]);
        },
        onError: () => {
          Alert.alert(t('manager_campaigns.join_error'));
        },
      }
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('manager_campaigns.system_detail_title')}
        onBackPress={() => navigation.goBack()}
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
              <CampaignStatusBadge
                isActive={campaign.isActive}
                isRegisterable={campaign.isRegisterable}
              />
            </View>
            {campaign.description ? (
              <Text className="mb-3 text-sm text-gray-600">
                {campaign.description}
              </Text>
            ) : null}
            <View className="rounded-xl bg-gray-50 p-3">
              <Text className="text-xs font-semibold uppercase text-gray-500">
                {t('manager_campaigns.registration_period')}
              </Text>
              <Text className="mt-1 text-sm font-medium text-gray-800">
                {formatDate(campaign.registrationStartDate)} →{' '}
                {formatDate(campaign.registrationEndDate)}
              </Text>
            </View>
            <View className="mt-3 rounded-xl bg-gray-50 p-3">
              <Text className="text-xs font-semibold uppercase text-gray-500">
                {t('manager_campaigns.active_period')}
              </Text>
              <Text className="mt-1 text-sm font-medium text-gray-800">
                {formatDate(campaign.startDate)} →{' '}
                {formatDate(campaign.endDate)}
              </Text>
            </View>
          </View>

          {campaign.isRegisterable && branches.length > 0 && (
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <Text className="mb-3 text-base font-bold text-gray-900">
                {t('manager_campaigns.select_branches')}
              </Text>
              {branches.map((branch) => {
                const isJoined = alreadyJoinedIds.includes(branch.branchId);
                const isSelected = selectedBranchIds.includes(branch.branchId);
                return (
                  <TouchableOpacity
                    key={branch.branchId}
                    onPress={() => !isJoined && toggleBranch(branch.branchId)}
                    className={`mb-2 flex-row items-center justify-between rounded-xl border p-3 ${
                      isJoined
                        ? 'border-green-200 bg-green-50'
                        : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 bg-gray-50'
                    }`}
                    disabled={isJoined}
                  >
                    <Text
                      className={`text-sm font-medium ${isJoined ? 'text-green-700' : 'text-gray-800'}`}
                    >
                      {branch.name}
                    </Text>
                    {isJoined ? (
                      <Text className="text-xs font-semibold text-green-600">
                        {t('manager_campaigns.already_joined')}
                      </Text>
                    ) : (
                      <View
                        className={`h-5 w-5 rounded-full border-2 ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}`}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                className="mt-4 items-center rounded-full bg-primary py-3"
                onPress={handleJoin}
                disabled={
                  joinCampaign.isPending || selectedBranchIds.length === 0
                }
              >
                <Text className="text-base font-bold text-white">
                  {joinCampaign.isPending
                    ? t('common.saving')
                    : t('manager_campaigns.join_button')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
