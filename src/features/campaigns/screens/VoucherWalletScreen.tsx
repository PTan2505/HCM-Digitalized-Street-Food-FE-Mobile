import { Ionicons } from '@expo/vector-icons';
import { VoucherCard } from '@features/campaigns/components/VoucherCard';
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
  ScrollView,
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
  { key: 'all', labelKey: 'campaign.voucher_tab_all' },
  { key: 'system', labelKey: 'campaign.voucher_tab_system' },
  { key: 'restaurant', labelKey: 'campaign.voucher_tab_vendor' },
];

const isExpired = (voucher: Voucher): boolean =>
  new Date(voucher.expiresAt) <= new Date();

const isExpiringSoon = (voucher: Voucher): boolean => {
  const expiresAt = new Date(voucher.expiresAt);
  const now = new Date();
  const hoursLeft = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft <= 24;
};

export const VoucherWalletScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    displayedVouchers,
    activeVouchers,
    expiredVouchers,
    systemVouchers,
    restaurantVouchers,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    showHistory,
    setShowHistory,
    handleRefresh,
  } = useVoucherWallet();

  const [expandedVoucherId, setExpandedVoucherId] = useState<string | null>(
    null
  );

  const handleVoucherPress = useCallback((voucher: Voucher) => {
    setExpandedVoucherId((prev) =>
      prev === voucher.voucherId ? null : voucher.voucherId
    );
  }, []);

  const tabCount = (key: VoucherTab): number => {
    if (key === 'all') return activeVouchers.length;
    if (key === 'system') return systemVouchers.length;
    return restaurantVouchers.length;
  };

  const emptyKey = showHistory
    ? 'campaign.voucher_empty_history'
    : activeTab === 'system'
      ? 'campaign.voucher_empty_system'
      : activeTab === 'restaurant'
        ? 'campaign.voucher_empty_vendor'
        : 'campaign.voucher_empty';

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-gray-50"
    >
      {/* ── Header ── */}
      <View className="flex-row items-center bg-white px-4 py-3 shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-lg font-bold text-gray-900">
          {showHistory
            ? t('campaign.history_title')
            : t('campaign.voucher_wallet')}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setShowHistory((prev) => !prev);
            setExpandedVoucherId(null);
          }}
          hitSlop={8}
          className="ml-2"
        >
          <Ionicons
            name={showHistory ? 'ticket-outline' : 'time-outline'}
            size={22}
            color={showHistory ? '#a1d973' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Tab bar (hidden in history mode) ── */}
      {!showHistory && (
        <View className="bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tabCount(tab.key);
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => {
                    setActiveTab(tab.key);
                    setExpandedVoucherId(null);
                  }}
                  className="mr-4 pb-3 pt-3"
                >
                  <View className="flex-row items-center">
                    <Text
                      className={`text-sm font-semibold ${isActive ? 'text-[#a1d973]' : 'text-gray-500'}`}
                    >
                      {t(tab.labelKey)}
                    </Text>
                    {count > 0 && (
                      <View
                        className={`ml-1.5 rounded-full px-1.5 py-0.5 ${isActive ? 'bg-[#a1d973]' : 'bg-gray-200'}`}
                      >
                        <Text
                          className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </View>
                  {isActive && (
                    <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#a1d973]" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View className="h-px bg-gray-100" />
        </View>
      )}

      {/* ── History badge ── */}
      {showHistory && expiredVouchers.length > 0 && (
        <View className="mx-4 mt-3 flex-row items-center rounded-lg bg-amber-50 px-3 py-2">
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#D97706"
          />
          <Text className="ml-1.5 text-xs text-amber-700">
            {t('campaign.voucher_expired')} · {expiredVouchers.length}
          </Text>
        </View>
      )}

      {/* ── Content ── */}
      {isLoading && displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : error && displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
          <Text className="mt-3 text-center text-sm text-gray-400">
            {error}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-4 rounded-full bg-[#a1d973] px-6 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              {t('campaign.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : displayedVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="ticket-outline" size={56} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {t(emptyKey)}
          </Text>
          {!showHistory && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mt-4 rounded-full bg-[#a1d973] px-6 py-2"
            >
              <Text className="text-sm font-semibold text-white">
                {t('campaign.discover_campaigns')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedVouchers}
          keyExtractor={(item) => item.voucherId}
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
          renderItem={({ item }) => (
            <VoucherCard
              voucher={item}
              isExpired={isExpired(item)}
              isExpiringSoon={isExpiringSoon(item)}
              isExpanded={expandedVoucherId === item.voucherId}
              onPress={() => handleVoucherPress(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};
