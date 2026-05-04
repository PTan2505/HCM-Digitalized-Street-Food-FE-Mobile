import Header from '@components/Header';
import { CampaignStatusBadge } from '@manager/campaigns/components/CampaignStatusBadge';
import { useVendorCampaignDetail } from '@manager/campaigns/hooks/useVendorCampaigns';
import {
  useAddBranchesToCampaign,
  useCampaignBranches,
  useRemoveBranchesFromCampaign,
} from '@manager/campaigns/hooks/useSystemCampaigns';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
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
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
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
  const { data: campaignBranches } = useCampaignBranches(
    campaignId,
    campaign?.isSystemCampaign ?? undefined
  );
  const { data: vendorInfo } = useVendorInfo();
  const removeBranches = useRemoveBranchesFromCampaign(campaignId);
  const addBranches = useAddBranchesToCampaign(campaignId);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState<number | null>(null);

  const isSystemCampaign = campaign?.isSystemCampaign === true;
  const allVendorBranches = vendorInfo?.branches ?? [];
  const enrolledBranchIds = new Set(
    campaignBranches?.items.map((b) => b.branchId) ?? []
  );
  const enrolledCount = enrolledBranchIds.size;

  const handleRemoveBranch = (branchId: number, branchName: string): void => {
    Alert.alert(
      t('manager_campaigns.remove_branch_title'),
      t('manager_campaigns.remove_branch_confirm', { name: branchName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: async (): Promise<void> => {
            setIsRemoving(branchId);
            try {
              await removeBranches.mutateAsync([branchId]);
            } catch {
              Alert.alert(
                t('auth.error'),
                t('manager_campaigns.remove_branch_error')
              );
            } finally {
              setIsRemoving(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('manager_campaigns.detail_title')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={
          campaign && !campaign.isSystemCampaign
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
          {/* Campaign info */}
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
              <Text className="mb-1 text-xs font-semibold uppercase text-gray-500">
                {t('manager_campaigns.date_range_label')}
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                {formatDate(campaign.startDate)} →{' '}
                {formatDate(campaign.endDate)}
              </Text>
            </View>
          </View>

          {/* Count badges */}
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-blue-100 bg-blue-50 p-3">
              <Text className="text-xs font-medium text-blue-600">
                {t('manager_campaigns.total_branches_label')}
              </Text>
              <Text className="text-2xl font-extrabold text-blue-700">
                {allVendorBranches.length}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl border border-green-100 bg-green-50 p-3">
              <Text className="text-xs font-medium text-green-600">
                {t('manager_campaigns.enrolled_branches')}
              </Text>
              <Text className="text-2xl font-extrabold text-green-700">
                {enrolledCount}
              </Text>
            </View>
          </View>

          {/* Branch list — all vendor branches with enrollment status */}
          {allVendorBranches.length === 0 ? (
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <Text className="text-sm text-gray-400">
                {t('manager_campaigns.no_branches')}
              </Text>
            </View>
          ) : (
            <View className="rounded-2xl bg-white shadow-sm">
              {allVendorBranches.map((branch, idx) => {
                const isEnrolled = enrolledBranchIds.has(branch.branchId);
                return (
                  <View
                    key={branch.branchId}
                    className={`flex-row items-center px-4 py-3 ${
                      idx < allVendorBranches.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                  >
                    <View className="flex-1 pr-2">
                      <Text
                        className="text-sm font-semibold text-gray-800"
                        numberOfLines={1}
                      >
                        {branch.name}
                      </Text>
                      {branch.addressDetail ? (
                        <Text
                          className="text-xs text-gray-500"
                          numberOfLines={1}
                        >
                          {[branch.addressDetail, branch.ward]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                      ) : null}
                    </View>

                    {/* Status chip */}
                    <View
                      className={`mr-2 rounded-full border px-2.5 py-1 ${
                        isEnrolled
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isEnrolled ? 'text-green-700' : 'text-gray-500'
                        }`}
                      >
                        {isEnrolled
                          ? t('manager_campaigns.branch_enrolled')
                          : t('manager_campaigns.branch_not_enrolled')}
                      </Text>
                    </View>

                    {/* Action button — hidden for system campaigns */}
                    {!isSystemCampaign &&
                      (isEnrolled ? (
                        <TouchableOpacity
                          className="rounded-full bg-red-50 px-3 py-1.5"
                          disabled={isRemoving === branch.branchId}
                          onPress={() =>
                            handleRemoveBranch(branch.branchId, branch.name)
                          }
                        >
                          {isRemoving === branch.branchId ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                          ) : (
                            <Text className="text-xs font-semibold text-red-500">
                              {t('common.remove')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          className="rounded-full bg-primary/10 px-3 py-1.5"
                          disabled={isAdding === branch.branchId}
                          onPress={async (): Promise<void> => {
                            setIsAdding(branch.branchId);
                            try {
                              await addBranches.mutateAsync([branch.branchId]);
                            } catch {
                              Alert.alert(
                                t('auth.error'),
                                t('manager_campaigns.add_branch_error')
                              );
                            } finally {
                              setIsAdding(null);
                            }
                          }}
                        >
                          {isAdding === branch.branchId ? (
                            <ActivityIndicator size="small" color="#9FD356" />
                          ) : (
                            <Text className="text-xs font-semibold text-primary">
                              {t('manager_campaigns.add')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
