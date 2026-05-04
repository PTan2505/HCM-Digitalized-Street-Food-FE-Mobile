import Header from '@components/Header';
import { CampaignStatusBadge } from '@manager/campaigns/components/CampaignStatusBadge';
import { CampaignVoucherCard } from '@manager/campaigns/components/CampaignVoucherCard';
import {
  useJoinSystemCampaign,
  useSystemCampaignDetail,
} from '@manager/campaigns/hooks/useSystemCampaigns';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RouteParams {
  campaignId: number;
}

const formatDatetime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

  const { data: tiers = [] } = useQuery({
    queryKey: queryKeys.tiers.all,
    queryFn: () => axiosApi.tierApi.getTiers(),
    staleTime: 5 * 60_000,
  });

  const { data: vouchers = [] } = useQuery({
    queryKey: queryKeys.vouchers.campaignVoucher(campaignId),
    queryFn: () => axiosApi.voucherApi.getCampaignVouchers(campaignId),
    enabled: campaignId > 0,
    staleTime: 60_000,
  });

  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  const allBranches = useMemo(
    () => vendorInfo?.branches ?? [],
    [vendorInfo?.branches]
  );

  const joinableBranches = useMemo(() => {
    if (!campaign) return [];
    if (campaign.joinableBranch != null) {
      const joinableSet = new Set(campaign.joinableBranch);
      return allBranches.filter((b) => joinableSet.has(b.branchId));
    }
    const joinedSet = new Set(campaign.joinedBranchIds ?? []);
    return allBranches.filter((b) => !joinedSet.has(b.branchId));
  }, [campaign, allBranches]);

  const requiredTierLabel = useMemo((): string => {
    if (!campaign?.requiredTierId)
      return t('manager_campaigns.no_required_tier');
    const tier = tiers.find((item) => item.tierId === campaign.requiredTierId);
    return tier?.name ?? `#${campaign.requiredTierId}`;
  }, [campaign, tiers, t]);

  const handleToggleAll = (): void => {
    if (selectedBranchIds.length === joinableBranches.length) {
      setSelectedBranchIds([]);
    } else {
      setSelectedBranchIds(joinableBranches.map((b) => b.branchId));
    }
  };

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
        onSuccess: async (res) => {
          if (!res.success) {
            Alert.alert(t('manager_campaigns.join_error'), res.message ?? '');
            return;
          }

          const orderCodeNum = res.orderCode ? Number(res.orderCode) : null;
          const joinFee = campaign?.joinFee ?? 0;
          const computedAmount =
            res.amount ?? selectedBranchIds.length * joinFee;
          const firstBranchName =
            allBranches.find((b) => b.branchId === selectedBranchIds[0])
              ?.name ?? '';

          if (res.bin && res.accountNumber) {
            navigation.navigate('PaymentQR', {
              orderId: orderCodeNum ?? campaignId,
              branchId: selectedBranchIds[0] ?? 0,
              orderCode: orderCodeNum,
              totalAmount: computedAmount,
              branchName: firstBranchName,
              bin: res.bin,
              accountNumber: res.accountNumber,
              accountName: res.accountName,
              mode: 'campaign',
              campaignId,
              description: t('manager_campaigns.join_payment_description', {
                campaignId,
              }),
            });
            setSelectedBranchIds([]);
            return;
          }

          if (res.paymentUrl) {
            const canOpen = await Linking.canOpenURL(res.paymentUrl);
            if (!canOpen) {
              Alert.alert(t('manager_branch.subscribe_external_unavailable'));
              return;
            }
            await Linking.openURL(res.paymentUrl);
            setSelectedBranchIds([]);
          }
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
          {/* Campaign header */}
          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-3 flex-row items-start justify-between">
              <Text className="flex-1 pr-2 text-xl font-bold text-gray-900">
                {campaign.name}
              </Text>
              <CampaignStatusBadge
                isActive={campaign.isActive}
                isRegisterable={campaign.isRegisterable}
                startDate={campaign.startDate}
                endDate={campaign.endDate}
                registrationStartDate={campaign.registrationStartDate}
                registrationEndDate={campaign.registrationEndDate}
              />
            </View>
            {campaign.description ? (
              <Text className="mb-3 text-sm text-gray-600">
                {campaign.description}
              </Text>
            ) : null}

            {/* Registration period */}
            <View className="mb-3 rounded-xl bg-gray-50 p-3">
              <Text className="mb-1 text-xs font-semibold uppercase text-gray-500">
                {t('manager_campaigns.registration_period')}
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                {t('manager_campaigns.date_from')}:{' '}
                {formatDatetime(campaign.registrationStartDate)}
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                {t('manager_campaigns.date_to')}:{' '}
                {formatDatetime(campaign.registrationEndDate)}
              </Text>
            </View>

            {/* Active period */}
            <View className="rounded-xl bg-gray-50 p-3">
              <Text className="mb-1 text-xs font-semibold uppercase text-gray-500">
                {t('manager_campaigns.active_period')}
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                {t('manager_campaigns.date_from')}:{' '}
                {formatDatetime(campaign.startDate)}
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                {t('manager_campaigns.date_to')}:{' '}
                {formatDatetime(campaign.endDate)}
              </Text>
            </View>
          </View>

          {/* Campaign details */}
          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-500">
                {t('manager_campaigns.target_segment')}
              </Text>
              <Text className="ml-4 flex-shrink text-right text-sm font-medium text-gray-800">
                {campaign.targetSegment?.trim()
                  ? campaign.targetSegment
                  : t('manager_campaigns.target_segment_all')}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-500">
                {t('manager_campaigns.required_tier')}
              </Text>
              <Text className="ml-4 text-right text-sm font-medium text-gray-800">
                {requiredTierLabel}
              </Text>
            </View>
          </View>

          {/* Vouchers */}
          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-900">
                {t('manager_campaigns.campaign_vouchers')}
              </Text>
              {vouchers.length > 0 && (
                <View className="rounded-full bg-gray-100 px-2 py-0.5">
                  <Text className="text-xs font-semibold text-gray-500">
                    {vouchers.length}
                  </Text>
                </View>
              )}
            </View>
            {vouchers.length === 0 ? (
              <Text className="text-sm text-gray-400">
                {t('manager_campaigns.no_vouchers')}
              </Text>
            ) : (
              <View className="gap-3">
                {vouchers.map((v) => (
                  <CampaignVoucherCard key={v.voucherId} voucher={v} />
                ))}
              </View>
            )}
          </View>

          {/* Joinable branches */}
          {campaign.isRegisterable && (
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-bold text-gray-900">
                  {t('manager_campaigns.joinable_branches')}
                </Text>
                {joinableBranches.length > 0 && (
                  <TouchableOpacity onPress={handleToggleAll}>
                    <Text className="text-xs font-semibold text-primary">
                      {selectedBranchIds.length === joinableBranches.length
                        ? t('manager_campaigns.deselect_all')
                        : t('manager_campaigns.select_all')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {joinableBranches.length === 0 ? (
                <Text className="text-sm text-gray-400">
                  {t('manager_campaigns.no_joinable_branches')}
                </Text>
              ) : (
                <>
                  {joinableBranches.map((branch) => {
                    const isSelected = selectedBranchIds.includes(
                      branch.branchId
                    );
                    return (
                      <TouchableOpacity
                        key={branch.branchId}
                        onPress={() => toggleBranch(branch.branchId)}
                        className={`mb-2 flex-row items-center justify-between rounded-xl border p-3 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <Text
                          className={`flex-1 text-sm font-medium ${
                            isSelected ? 'text-primary' : 'text-gray-800'
                          }`}
                          numberOfLines={1}
                        >
                          {branch.name}
                        </Text>
                        <View
                          className={`h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <Text className="text-xs font-bold leading-none text-white">
                              ✓
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    className={`mt-2 items-center rounded-full py-3 ${
                      joinCampaign.isPending || selectedBranchIds.length === 0
                        ? 'bg-gray-300'
                        : 'bg-primary'
                    }`}
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
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
