import Header from '@components/Header';
import { useSubscriptionPrice } from '@features/customer/home/hooks/useSettings';
import { FontAwesome6 } from '@expo/vector-icons';
import { BranchStatusBadge } from '@manager/vendor-branches/components/BranchStatusBadge';
import { useCreateSubscriptionPaymentLink } from '@manager/vendor-branches/hooks/useCreateBranchFlow';
import { useVendorBranchDetail } from '@manager/vendor-branches/hooks/useVendorBranches';
import { useNavigation, useRoute } from '@react-navigation/native';
import { setActiveBranchId } from '@slices/managerAuth';
import React, { useEffect } from 'react';
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
import { useDispatch } from 'react-redux';

interface RouteParams {
  branchId: number;
}

interface NavEntry {
  icon: string;
  label: string;
  route: string;
  params?: Record<string, unknown>;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}): React.JSX.Element => (
  <View className="flex-row justify-between border-b border-gray-100 py-3">
    <Text className="text-sm text-gray-500">{label}</Text>
    <Text className="max-w-[60%] text-right text-sm font-medium text-gray-900">
      {value !== null && value !== undefined ? String(value) : '—'}
    </Text>
  </View>
);

export const VendorBranchDetailScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const route = useRoute();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();
  const { branchId } = route.params as RouteParams;
  const {
    data: branch,
    isLoading,
    isError,
    refetch,
  } = useVendorBranchDetail(branchId);
  const subscribeMutation = useCreateSubscriptionPaymentLink();
  const subscriptionPrice = useSubscriptionPrice();

  // Sync the selected vendor branch into Redux so downstream screens
  // (Menu, Schedule, Feedback, Day Off) can read branchId from the store.
  useEffect(() => {
    dispatch(setActiveBranchId(branchId));
  }, [branchId, dispatch]);

  const handleSubscribe = async (): Promise<void> => {
    if (!branch || subscribeMutation.isPending) return;
    try {
      const res = await subscribeMutation.mutateAsync({ branchId });
      if (!res.success) {
        Alert.alert(
          t('manager_branch.subscribe_payment_failed'),
          res.message ?? ''
        );
        return;
      }

      const orderCodeNum = res.orderCode ? Number(res.orderCode) : null;

      // If backend returned VietQR fields, render the QR locally.
      if (res.bin && res.accountNumber) {
        navigation.navigate('PaymentQR', {
          orderId: branchId,
          branchId,
          orderCode: orderCodeNum,
          totalAmount: res.amount ?? subscriptionPrice,
          branchName: branch.name,
          bin: res.bin,
          accountNumber: res.accountNumber,
          accountName: res.accountName,
          mode: 'subscription',
          description: t('manager_branch.subscribe_payment_description', {
            branchId,
          }),
        });
        return;
      }

      // Fallback: open the hosted PayOS page if QR fields aren't available.
      if (res.paymentUrl) {
        const canOpen = await Linking.canOpenURL(res.paymentUrl);
        if (!canOpen) {
          Alert.alert(t('manager_branch.subscribe_external_unavailable'));
          return;
        }
        await Linking.openURL(res.paymentUrl);
      }
    } catch (error) {
      console.error('Subscribe payment failed:', error);
      Alert.alert(t('manager_branch.subscribe_payment_failed'));
    }
  };

  const navEntries: NavEntry[] = [
    {
      icon: 'calendar-days',
      label: t('vendor_branches.nav_schedule'),
      route: 'ManagerSchedule',
    },
    {
      icon: 'calendar-xmark',
      label: t('vendor_branches.nav_day_off'),
      route: 'ManagerDayOff',
    },
    {
      icon: 'utensils',
      label: t('vendor_branches.nav_menu'),
      route: 'ManagerMenu',
    },
    {
      icon: 'comments',
      label: t('vendor_branches.nav_feedback'),
      route: 'ManagerFeedback',
    },
    {
      icon: 'flag-checkered',
      label: t('vendor_branches.nav_campaigns'),
      route: 'VendorCampaigns',
    },
  ];

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={branch?.name ?? t('vendor_branches.detail_title')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={
          branch
            ? {
                label: t('manager_branch.edit'),
                onPress: () =>
                  navigation.navigate('VendorEditBranch', { branchId }),
              }
            : undefined
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : isError || !branch ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('manager_branch.error_load')}
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
          <View className="rounded-2xl bg-white px-4 shadow-sm">
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-sm text-gray-500">
                {t('vendor_branches.status')}
              </Text>
              <BranchStatusBadge
                isActive={branch.isActive}
                isVerified={branch.isVerified}
              />
            </View>
            <InfoRow label={t('manager_branch.name')} value={branch.name} />
            <InfoRow
              label={t('manager_branch.phone')}
              value={branch.phoneNumber}
            />
            <InfoRow label={t('manager_branch.email')} value={branch.email} />
            <InfoRow
              label={t('manager_branch.address_detail')}
              value={branch.addressDetail}
            />
            <InfoRow label={t('manager_branch.ward')} value={branch.ward} />
            <InfoRow label={t('manager_branch.city')} value={branch.city} />
            <InfoRow
              label={t('manager_branch.avg_rating')}
              value={branch.avgRating?.toFixed(1)}
            />
            <InfoRow
              label={t('manager_branch.total_reviews')}
              value={branch.totalReviewCount ?? 0}
            />
          </View>

          {!branch.isSubscribed && (
            <TouchableOpacity
              onPress={() => void handleSubscribe()}
              disabled={subscribeMutation.isPending}
              className={`flex-row items-center justify-center gap-2 rounded-2xl py-3 ${
                subscribeMutation.isPending ? 'bg-gray-300' : 'bg-primary'
              }`}
            >
              {subscribeMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <FontAwesome6 name="qrcode" size={16} color="#fff" />
                  <Text className="text-base font-semibold text-white">
                    {t('manager_branch.subscribe_pay')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <Text className="mt-2 text-sm font-semibold text-gray-500">
            {t('vendor_branches.manage_section')}
          </Text>

          <View className="rounded-2xl bg-white shadow-sm">
            {navEntries.map((entry, idx) => (
              <TouchableOpacity
                key={entry.route}
                className={`flex-row items-center justify-between px-4 py-4 ${idx < navEntries.length - 1 ? 'border-b border-gray-100' : ''}`}
                onPress={() => navigation.navigate(entry.route, entry.params)}
              >
                <View className="flex-row items-center gap-3">
                  <FontAwesome6 name={entry.icon} size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-800">
                    {entry.label}
                  </Text>
                </View>
                <FontAwesome6 name="chevron-right" size={12} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
