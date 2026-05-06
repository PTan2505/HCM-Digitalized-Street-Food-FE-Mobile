import Header from '@components/Header';
import TabBar from '@components/TabBar';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useVendorBalanceHistoryQuery } from '@manager/payment/hooks/useVendorBalanceHistoryQuery';
import type {
  VendorBalanceHistoryItem,
  VendorPaymentMethod,
} from '@manager/payment/types/payment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentTab = 'money_in' | 'money_out';

const METHOD_ICON: Record<VendorPaymentMethod, keyof typeof Ionicons.glyphMap> =
  {
    'Vendor Wallet': 'wallet-outline',
    PAYOS_PAYOUT: 'arrow-up-circle-outline',
  };

const SkeletonRow = (): JSX.Element => (
  <View className="mx-4 mb-3 rounded-2xl border border-gray-200 bg-white p-4">
    <View className="flex-row items-center justify-between">
      <View className="h-3 w-24 rounded bg-gray-200" />
      <View className="h-5 w-16 rounded-full bg-gray-200" />
    </View>
    <View className="mt-3 h-4 w-40 rounded bg-gray-100" />
    <View className="mt-2 h-3 w-32 rounded bg-gray-100" />
    <View className="mt-3 h-px bg-gray-100" />
    <View className="mt-3 flex-row justify-between">
      <View className="h-3 w-20 rounded bg-gray-100" />
      <View className="h-4 w-24 rounded bg-gray-200" />
    </View>
  </View>
);

const VendorBalanceSkeleton = (): JSX.Element => (
  <View className="px-4 pt-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonRow key={`skeleton-${i}`} />
    ))}
  </View>
);

const VendorBalanceItem = ({
  item,
}: {
  item: VendorBalanceHistoryItem;
}): JSX.Element => {
  const { t } = useTranslation();
  const isOutgoing = item.amount < 0;
  const methodIcon = item.paymentMethod
    ? (METHOD_ICON[item.paymentMethod] ?? 'card-outline')
    : 'card-outline';

  const methodLabel =
    item.paymentMethod === 'PAYOS_PAYOUT'
      ? t('payment_history.method_payout', 'Rút tiền')
      : isOutgoing
        ? t('vendor_balance.method_debit', 'Trừ ví vendor')
        : t('vendor_balance.method_credit', 'Cộng ví vendor');

  const formattedDate = new Date(item.createdAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="mx-4 mb-3 rounded-2xl border border-gray-200 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name={methodIcon} size={15} color="#6b7280" />
          <Text className="text-sm text-gray-500">{methodLabel}</Text>
        </View>
        {item.status === 'PAID' ? (
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: '#00B14F20' }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: '#00B14F' }}
            >
              {t('payment_history.status_paid', 'Thành công')}
            </Text>
          </View>
        ) : null}
      </View>

      <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
        {item.description}
      </Text>

      {item.transactionCode ? (
        <Text className="mt-1 text-xs text-gray-400">
          {t('payment_history.transaction_code', 'Mã GD')}:{' '}
          {item.transactionCode}
        </Text>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
        <Text className="text-sm text-gray-400">{formattedDate}</Text>
        <Text
          className="text-base font-bold"
          style={{ color: isOutgoing ? '#e66772' : '#00B14F' }}
        >
          {isOutgoing ? '-' : '+'}
          {Math.abs(item.amount).toLocaleString('vi-VN')}₫
        </Text>
      </View>
    </View>
  );
};

export const VendorBalanceHistoryScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<PaymentTab>('money_in');
  const { transactions, isLoading, refetch } = useVendorBalanceHistoryQuery();

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      void refetch();
    }, [refetch])
  );

  const tabs = useMemo(
    () => [
      {
        key: 'money_in' as const,
        label: t('payment_history.tab_money_in', 'Tiền vào'),
      },
      {
        key: 'money_out' as const,
        label: t('payment_history.tab_money_out', 'Tiền ra'),
      },
    ],
    [t]
  );

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'money_in') {
      return transactions.filter((tx) => tx.amount > 0);
    }
    return transactions.filter((tx) => tx.amount < 0);
  }, [transactions, activeTab]);

  const renderItem = ({
    item,
  }: {
    item: VendorBalanceHistoryItem;
  }): JSX.Element => <VendorBalanceItem item={item} />;

  const emptyIcon: keyof typeof Ionicons.glyphMap =
    activeTab === 'money_in'
      ? 'arrow-down-circle-outline'
      : 'arrow-up-circle-outline';

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('vendor_balance.title', 'Lịch sử số dư')}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        ListHeaderComponent={
          <TabBar<PaymentTab>
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="equal"
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <VendorBalanceSkeleton />
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name={emptyIcon} size={48} color={COLORS.primary} />
              <Text className="mt-3 text-base font-semibold text-gray-900">
                {t('payment_history.empty_title', 'Chưa có giao dịch')}
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500">
                {activeTab === 'money_in'
                  ? t(
                      'vendor_balance.empty_in',
                      'Chưa có khoản tiền nào được cộng vào ví'
                    )
                  : t('vendor_balance.empty_out', 'Chưa có khoản rút tiền nào')}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};
