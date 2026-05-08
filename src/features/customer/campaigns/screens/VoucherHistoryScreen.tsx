import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import {
  getExpiresAt,
  isExpired,
  isUsed,
} from '@customer/campaigns/utils/voucher';
import { Ionicons } from '@expo/vector-icons';
import { TicketVoucherCard } from '@features/customer/campaigns/components/TicketVoucherCard';
import { useMyVouchersQuery } from '@features/customer/campaigns/hooks/useMyVouchersQuery';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HistoryTab = 'used' | 'expired';

const TABS: { key: HistoryTab; labelKey: string }[] = [
  { key: 'used', labelKey: 'campaign.used' },
  { key: 'expired', labelKey: 'campaign.expired' },
];

export const VoucherHistoryScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    vouchers: allVouchers,
    isLoading,
    refetch: handleRefresh,
  } = useMyVouchersQuery();

  const [activeTab, setActiveTab] = useState<HistoryTab>('expired');

  const handleTabChange = useCallback((key: HistoryTab) => {
    setActiveTab(key);
  }, []);

  const usedVouchers = allVouchers.filter(isUsed);
  const expiredVouchers = allVouchers.filter((v) => isExpired(v) && !isUsed(v));

  const displayedVouchers =
    activeTab === 'used' ? usedVouchers : expiredVouchers;

  const emptyKey =
    activeTab === 'used'
      ? 'campaign.voucher_empty_history'
      : 'campaign.voucher_empty_history';

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('campaign.history_title')}
        onBackPress={() => navigation.goBack()}
      />

      {/* Tabs */}
      {/* <TabBar
        tabs={TABS.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabCount={(tab) =>
          tab === 'used' ? usedVouchers.length : expiredVouchers.length
        }
        variant="equal"
      /> */}

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
              expiresText={
                getExpiresAt(item)?.toLocaleDateString('vi-VN') ?? ''
              }
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
