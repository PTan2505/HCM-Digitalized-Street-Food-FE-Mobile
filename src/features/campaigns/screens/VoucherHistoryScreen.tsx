import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@constants/colors';
import { TicketVoucherCard } from '@features/campaigns/components/TicketVoucherCard';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import type { Voucher } from '@slices/campaigns';
import {
  fetchMyVouchers,
  selectVouchers,
  selectVouchersLoading,
} from '@slices/campaigns';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type HistoryTab = 'used' | 'expired';

const TABS: { key: HistoryTab; labelKey: string }[] = [
  { key: 'used', labelKey: 'campaign.used' },
  { key: 'expired', labelKey: 'campaign.expired' },
];

const getExpiresAt = (voucher: Voucher): Date =>
  new Date(voucher.expiredDate ?? voucher.endDate ?? '9999-12-31');

export const VoucherHistoryScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const allVouchers = useAppSelector(selectVouchers);
  const isLoading = useAppSelector(selectVouchersLoading);

  const [activeTab, setActiveTab] = useState<HistoryTab>('used');
  const [tabWidth, setTabWidth] = useState(0);

  const indicatorX = useSharedValue(0);
  const tab0Active = useSharedValue(1);
  const tab1Active = useSharedValue(0);
  const tabActives = [tab0Active, tab1Active];

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const tab0TextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tab0Active.value, [0, 1], ['#9CA3AF', COLORS.primaryLight]),
  }));
  const tab1TextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(tab1Active.value, [0, 1], ['#9CA3AF', COLORS.primaryLight]),
  }));
  const tabTextStyles = [tab0TextStyle, tab1TextStyle];

  useEffect(() => {
    void dispatch(fetchMyVouchers());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    void dispatch(fetchMyVouchers());
  }, [dispatch]);

  const handleTabChange = useCallback(
    (key: HistoryTab) => {
      const newIdx = TABS.findIndex((tab) => tab.key === key);
      indicatorX.value = withTiming(newIdx * tabWidth, { duration: 250 });
      tabActives.forEach((v, i) => {
        v.value = withTiming(i === newIdx ? 1 : 0, { duration: 250 });
      });
      setActiveTab(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabWidth]
  );

  const usedVouchers = allVouchers.filter((v) => !v.isAvailable);
  const expiredVouchers = allVouchers.filter(
    (v) => getExpiresAt(v) <= new Date() && v.isAvailable
  );

  const displayedVouchers =
    activeTab === 'used' ? usedVouchers : expiredVouchers;

  const emptyKey =
    activeTab === 'used'
      ? 'campaign.voucher_empty_history'
      : 'campaign.voucher_empty_history';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-8 pt-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-gray-900">
          {t('campaign.history_title')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View className="border-b border-gray-200 px-4">
        <View
          className="flex-row"
          onLayout={(e) =>
            setTabWidth(e.nativeEvent.layout.width / TABS.length)
          }
        >
          {TABS.map((tab, i) => {
            const count =
              tab.key === 'used' ? usedVouchers.length : expiredVouchers.length;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabChange(tab.key)}
                className="flex-1 flex-row items-center justify-center gap-1 pb-3"
              >
                <Animated.Text
                  className="text-sm font-semibold"
                  style={tabTextStyles[i]}
                >
                  {t(tab.labelKey)}
                </Animated.Text>
                {count > 0 && (
                  <View className="rounded-full bg-gray-100 px-1.5 py-0.5">
                    <Text className="text-xs font-bold text-gray-500">
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <Animated.View
          style={[
            {
              width: tabWidth,
              height: 2,
              backgroundColor: COLORS.primary,
              marginTop: -2,
            },
            indicatorStyle,
          ]}
        />
      </View>

      {/* Content */}
      {isLoading && displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="ticket-outline" size={52} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {t(emptyKey)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedVouchers}
          keyExtractor={(item) => String(item.voucherId)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <TicketVoucherCard
              disabled
              discountText={
                item.voucherType.toUpperCase().includes('PERCENT')
                  ? `${item.discountValue}%`
                  : `${item.discountValue.toLocaleString('vi-VN')}đ`
              }
              title={item.voucherName}
              subtitle={
                item.maxDiscountValue != null
                  ? t('campaign.max_discount', {
                      amount: item.maxDiscountValue.toLocaleString('vi-VN'),
                    })
                  : undefined
              }
              expiresText={getExpiresAt(item).toLocaleDateString('vi-VN')}
              secondaryMetaText={
                !item.isAvailable
                  ? t('campaign.voucher_not_available')
                  : t('campaign.expired')
              }
              secondaryMetaIcon={
                !item.isAvailable
                  ? 'checkmark-done-outline'
                  : 'alert-circle-outline'
              }
              tertiaryMetaText={
                item.minAmountRequired != null
                  ? t('campaign.min_order', {
                      amount: item.minAmountRequired.toLocaleString('vi-VN'),
                    })
                  : undefined
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};
