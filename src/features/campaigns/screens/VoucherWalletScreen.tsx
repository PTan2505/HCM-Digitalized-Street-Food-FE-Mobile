import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { TicketVoucherCard } from '@features/campaigns/components/TicketVoucherCard';
import {
  useVoucherWallet,
  type VoucherTab,
} from '@features/campaigns/hooks/useVoucherWallet';
import { useNavigation } from '@react-navigation/native';
import type { Voucher } from '@slices/campaigns';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  LayoutChangeEvent,
  RefreshControl,
  ScrollView,
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

interface TabConfig {
  key: VoucherTab;
  labelKey: string;
}

interface TabLayout {
  x: number;
  width: number;
}

interface AnimatedTabLabelProps {
  isActive: boolean;
  label: string;
}

const TABS: TabConfig[] = [
  { key: 'all', labelKey: 'campaign.voucher_tab_all' },
  { key: 'campaign', labelKey: 'campaign.voucher_tab_campaign' },
  { key: 'system', labelKey: 'campaign.voucher_tab_system' },
  { key: 'restaurant', labelKey: 'campaign.voucher_tab_vendor' },
];

const getExpiresAt = (voucher: Voucher): Date =>
  new Date(voucher.expiredDate ?? voucher.endDate ?? '9999-12-31');

const isExpired = (voucher: Voucher): boolean =>
  getExpiresAt(voucher) <= new Date();

const isUsed = (voucher: Voucher): boolean => !voucher.isAvailable;

const isNotYetActive = (voucher: Voucher): boolean =>
  voucher.startDate != null && new Date(voucher.startDate) > new Date();

const isExpiringSoon = (voucher: Voucher): boolean => {
  const expiresAt = getExpiresAt(voucher);
  const now = new Date();
  const hoursLeft = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft <= 24;
};

const AnimatedTabLabel = ({
  isActive,
  label,
}: AnimatedTabLabelProps): JSX.Element => {
  const activeProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withTiming(isActive ? 1 : 0, { duration: 220 });
  }, [activeProgress, isActive]);

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeProgress.value,
      [0, 1],
      ['#6B7280', '#89D151']
    ),
  }));

  return (
    <Animated.Text className="text-sm font-semibold" style={textStyle}>
      {label}
    </Animated.Text>
  );
};

export const VoucherWalletScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isLoading, error, handleRefresh, getDisplayedVouchers, tabCount } =
    useVoucherWallet();

  const [activeTab, setActiveTab] = useState<VoucherTab>('all');
  const [expandedVoucherId, setExpandedVoucherId] = useState<number | null>(
    null
  );
  const [tabLayouts, setTabLayouts] = useState<
    Partial<Record<VoucherTab, TabLayout>>
  >({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const animateIndicator = useCallback(
    (tab: VoucherTab) => {
      const layout = tabLayouts[tab];
      if (!layout) {
        return;
      }

      indicatorX.value = withTiming(layout.x, { duration: 220 });
      indicatorWidth.value = withTiming(layout.width, { duration: 220 });
    },
    [indicatorWidth, indicatorX, tabLayouts]
  );

  useEffect(() => {
    animateIndicator(activeTab);
  }, [activeTab, animateIndicator]);

  const handleTabChange = useCallback(
    (key: VoucherTab) => {
      setActiveTab(key);
      setExpandedVoucherId(null);
      animateIndicator(key);
    },
    [animateIndicator]
  );

  const handleTabLayout = useCallback(
    (tab: VoucherTab, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((prev) => {
        const previousLayout = prev[tab];
        if (previousLayout?.x === x && previousLayout?.width === width) {
          return prev;
        }
        return { ...prev, [tab]: { x, width } };
      });
    },
    []
  );

  const handleVoucherPress = useCallback((voucher: Voucher) => {
    setExpandedVoucherId((prev) =>
      prev === voucher.voucherId ? null : voucher.voucherId
    );
  }, []);

  const displayedVouchers = getDisplayedVouchers(activeTab);

  const emptyKey =
    activeTab === 'system'
      ? 'campaign.voucher_empty_system'
      : activeTab === 'restaurant'
        ? 'campaign.voucher_empty_vendor'
        : 'campaign.voucher_empty';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-8 pt-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          {t('campaign.voucher_wallet')}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('VoucherHistory')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="history" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        className="border-b border-gray-200"
        style={{ flexGrow: 0 }}
      >
        <View className="relative flex-row gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tabCount(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabChange(tab.key)}
                onLayout={(event) => handleTabLayout(tab.key, event)}
                className={`flex-row items-center gap-1 px-4 py-1`}
              >
                <AnimatedTabLabel isActive={isActive} label={t(tab.labelKey)} />
                {count > 0 && (
                  <View
                    className={`rounded-full px-1.5 py-0.5 ${
                      isActive ? 'bg-gray-300' : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                bottom: -12,
                left: 0,
                height: 2,
                backgroundColor: '#a1d973',
              },
              indicatorStyle,
            ]}
          />
        </View>
      </ScrollView>

      {/* Content */}
      {isLoading && displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : error && displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
          <Text className="mt-3 text-center text-base text-gray-400">
            {error}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-4 rounded-full bg-[#a1d973] px-6 py-2.5"
          >
            <Text className="text-base font-semibold text-white">
              {t('campaign.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="ticket-outline" size={52} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {t(emptyKey)}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 rounded-full bg-[#a1d973] px-6 py-2.5"
          >
            <Text className="text-base font-semibold text-white">
              {t('campaign.discover_campaigns')}
            </Text>
          </TouchableOpacity>
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
              tintColor="#a1d973"
              colors={['#a1d973']}
            />
          }
          renderItem={({ item }) => {
            const expired = isExpired(item);
            const used = isUsed(item);
            const notYetActive = isNotYetActive(item);
            const disabled = expired || used;

            return (
              <View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleVoucherPress(item)}
                >
                  <TicketVoucherCard
                    disabled={disabled}
                    discountText={
                      item.voucherType.toUpperCase().includes('PERCENT')
                        ? `${item.discountValue}%`
                        : `${item.discountValue.toLocaleString('vi-VN')}đ`
                    }
                    title={item.voucherName}
                    subtitle={
                      item.maxDiscountValue != null
                        ? t('campaign.max_discount', {
                            amount:
                              item.maxDiscountValue.toLocaleString('vi-VN'),
                          })
                        : undefined
                    }
                    expiresText={getExpiresAt(item).toLocaleDateString('vi-VN')}
                    secondaryMetaText={
                      used
                        ? t('campaign.voucher_not_available')
                        : expired
                          ? t('campaign.expired')
                          : notYetActive
                            ? t('campaign.starts_on', {
                                date: new Date(
                                  item.startDate ?? ''
                                ).toLocaleDateString('vi-VN'),
                              })
                            : isExpiringSoon(item)
                              ? t('campaign.expiring_soon')
                              : t('campaign.voucher_active')
                    }
                    secondaryMetaIcon={
                      used
                        ? 'checkmark-done-outline'
                        : expired
                          ? 'alert-circle-outline'
                          : notYetActive
                            ? 'hourglass-outline'
                            : isExpiringSoon(item)
                              ? 'time-outline'
                              : 'checkmark-circle-outline'
                    }
                    tertiaryMetaText={
                      item.minAmountRequired != null
                        ? t('campaign.min_order', {
                            amount:
                              item.minAmountRequired.toLocaleString('vi-VN'),
                          })
                        : undefined
                    }
                    actionLabel={
                      disabled ? undefined : t('campaign.voucher_apply')
                    }
                    onActionPress={
                      disabled
                        ? undefined
                        : (): void => handleVoucherPress(item)
                    }
                    actionDisabled={disabled}
                  />
                </TouchableOpacity>

                {expandedVoucherId === item.voucherId && (
                  <View className="-mt-1 mb-3 rounded-b-2xl border border-t-0 border-dashed border-gray-200 bg-white px-4 pb-3 pt-2">
                    {used && (
                      <View className="mb-2 flex-row items-center gap-1">
                        <Ionicons
                          name="checkmark-done-outline"
                          size={14}
                          color="#9CA3AF"
                        />
                        <Text className="text-sm font-semibold text-gray-400">
                          {t('campaign.voucher_not_available')}
                        </Text>
                      </View>
                    )}
                    <Text className="text-sm text-gray-500">
                      {item.campaignId == null
                        ? t('campaign.scope_participating')
                        : t('campaign.scope_restaurant', { name: '' })}
                    </Text>
                    <Text className="mt-0.5 text-sm text-gray-400">
                      {t('campaign.valid_until', {
                        date: getExpiresAt(item).toLocaleDateString('vi-VN'),
                      })}
                    </Text>
                    {item.minAmountRequired != null && (
                      <Text className="mt-0.5 text-sm text-gray-400">
                        {t('campaign.min_order', {
                          amount:
                            item.minAmountRequired.toLocaleString('vi-VN'),
                        })}
                      </Text>
                    )}
                    {item.description ? (
                      <Text className="mt-1 text-sm text-gray-400">
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};
