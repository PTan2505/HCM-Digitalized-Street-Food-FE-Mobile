import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { TicketVoucherCard } from '@features/campaigns/components/TicketVoucherCard';
import {
  useVoucherWallet,
  type VoucherTab,
} from '@features/campaigns/hooks/useVoucherWallet';
import { useNavigation } from '@react-navigation/native';
import type { Voucher } from '@slices/campaigns';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
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

interface TabConfig {
  key: VoucherTab;
  labelKey: string;
}

const TABS: TabConfig[] = [
  { key: 'all', labelKey: 'campaign.voucher_tab_all' },
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

export const VoucherWalletScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isLoading, error, handleRefresh, getDisplayedVouchers, tabCount } =
    useVoucherWallet();

  const [activeTab, setActiveTab] = useState<VoucherTab>('all');
  const [expandedVoucherId, setExpandedVoucherId] = useState<number | null>(
    null
  );
  const [tabWidth, setTabWidth] = useState(0);

  const indicatorX = useSharedValue(0);
  const tabActives = TABS.map((_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSharedValue(i === 0 ? 1 : 0)
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const tabTextStyles = tabActives.map((v) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      color: interpolateColor(v.value, [0, 1], ['#9CA3AF', '#7AB82D']),
    }))
  );

  const handleTabChange = useCallback(
    (key: VoucherTab) => {
      const newIdx = TABS.findIndex((tab) => tab.key === key);
      indicatorX.value = withTiming(newIdx * tabWidth, { duration: 250 });
      tabActives.forEach((v, i) => {
        v.value = withTiming(i === newIdx ? 1 : 0, { duration: 250 });
      });
      setActiveTab(key);
      setExpandedVoucherId(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabWidth]
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
          className="mr-3"
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
      <View className="border-b border-gray-200 px-4">
        <View
          className="flex-row"
          onLayout={(e) =>
            setTabWidth(e.nativeEvent.layout.width / TABS.length)
          }
        >
          {TABS.map((tab, i) => {
            const count = tabCount(tab.key);
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
              backgroundColor: '#a1d973',
              marginTop: -2,
            },
            indicatorStyle,
          ]}
        />
      </View>

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
