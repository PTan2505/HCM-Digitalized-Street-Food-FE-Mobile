import Header from '@components/Header';
import TabBar from '@components/TabBar';
import { COLORS } from '@constants/colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { TicketVoucherCard } from '@features/campaigns/components/TicketVoucherCard';
import {
  useVoucherWallet,
  type VoucherTab,
} from '@features/campaigns/hooks/useVoucherWallet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Voucher } from '@slices/campaigns';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TabConfig {
  key: VoucherTab;
  labelKey: string;
}

const TABS: TabConfig[] = [
  { key: 'all', labelKey: 'voucher_wallet.voucher_tab_all' },
  { key: 'campaign', labelKey: 'voucher_wallet.voucher_tab_campaign' },
  { key: 'system', labelKey: 'voucher_wallet.voucher_tab_system' },
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
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { isLoading, error, handleRefresh, getDisplayedVouchers, tabCount } =
    useVoucherWallet();

  const [activeTab, setActiveTab] = useState<VoucherTab>('all');
  const [expandedVoucherId, setExpandedVoucherId] = useState<number | null>(
    null
  );

  const tabs = useMemo(
    () => TABS.map((tab) => ({ key: tab.key, label: t(tab.labelKey) })),
    [t]
  );

  const handleTabChange = useCallback((key: VoucherTab) => {
    setActiveTab(key);
    setExpandedVoucherId(null);
  }, []);

  const handleVoucherPress = useCallback((voucher: Voucher) => {
    setExpandedVoucherId((prev) =>
      prev === voucher.voucherId ? null : voucher.voucherId
    );
  }, []);

  const displayedVouchers = getDisplayedVouchers(activeTab);

  const emptyKey =
    activeTab === 'system'
      ? 'voucher_wallet.voucher_empty_system'
      : activeTab === 'restaurant'
        ? 'voucher_wallet.voucher_empty_vendor'
        : 'voucher_wallet.voucher_empty';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('voucher_wallet.voucher_wallet')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={{
          label: t('voucher_wallet.history'),
          icon: <MaterialIcons name="history" size={24} color="#111827" />,
          onPress: () => navigation.navigate('VoucherHistory'),
        }}
      />

      {/* Tabs */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabCount={tabCount}
        variant="equal"
      />

      {/* Content */}
      {isLoading && displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error && displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
          <Text className="mt-3 text-center text-base text-gray-400">
            {error}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-4 rounded-full bg-primary px-6 py-2.5"
          >
            <Text className="text-base font-semibold text-white">
              {t('voucher_wallet.retry')}
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
            className="mt-4 rounded-full bg-primary px-6 py-2.5"
          >
            <Text className="text-base font-semibold text-white">
              {t('voucher_wallet.discover_campaigns')}
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
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
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
                    quantity={item.quantity}
                    disabled={disabled}
                    discountText={
                      item.voucherType.toUpperCase().includes('PERCENT')
                        ? `${item.discountValue}%`
                        : `${item.discountValue.toLocaleString('vi-VN')}đ`
                    }
                    title={item.voucherName}
                    subtitle={
                      item.maxDiscountValue != null
                        ? t('voucher_wallet.max_discount', {
                            amount:
                              item.maxDiscountValue.toLocaleString('vi-VN'),
                          })
                        : undefined
                    }
                    expiresText={getExpiresAt(item).toLocaleDateString('vi-VN')}
                    secondaryMetaText={
                      used
                        ? t('voucher_wallet.voucher_not_available')
                        : expired
                          ? t('voucher_wallet.expired')
                          : notYetActive
                            ? t('voucher_wallet.starts_on', {
                                date: new Date(
                                  item.startDate ?? ''
                                ).toLocaleDateString('vi-VN'),
                              })
                            : isExpiringSoon(item)
                              ? t('voucher_wallet.expiring_soon')
                              : t('voucher_wallet.voucher_active')
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
                        ? t('voucher_wallet.min_order', {
                            amount:
                              item.minAmountRequired.toLocaleString('vi-VN'),
                          })
                        : undefined
                    }
                    actionLabel={
                      disabled ? undefined : t('voucher_wallet.voucher_apply')
                    }
                    onActionPress={
                      disabled
                        ? undefined
                        : (): void => {
                            navigation.navigate('VoucherApplicableBranches', {
                              voucher: item,
                            });
                          }
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
                        <Text className="text-base font-semibold text-gray-400">
                          {t('voucher_wallet.voucher_not_available')}
                        </Text>
                      </View>
                    )}
                    <Text className="text-base text-gray-500">
                      {item.campaignId == null
                        ? t('voucher_wallet.scope_participating')
                        : t('voucher_wallet.scope_restaurant', { name: '' })}
                    </Text>
                    <Text className="mt-0.5 text-base text-gray-400">
                      {t('voucher_wallet.valid_until', {
                        date: getExpiresAt(item).toLocaleDateString('vi-VN'),
                      })}
                    </Text>
                    {item.minAmountRequired != null && (
                      <Text className="mt-0.5 text-base text-gray-400">
                        {t('voucher_wallet.min_order', {
                          amount:
                            item.minAmountRequired.toLocaleString('vi-VN'),
                        })}
                      </Text>
                    )}
                    {item.description ? (
                      <Text className="mt-1 text-base text-gray-400">
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
