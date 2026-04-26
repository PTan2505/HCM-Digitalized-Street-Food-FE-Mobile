import Header from '@components/Header';
import TabBar from '@components/TabBar';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePaymentHistoryQuery } from '@user/hooks/payment/usePaymentHistoryQuery';
import type {
  PaymentMethod,
  PaymentTransaction,
  PaymentTransactionStatus,
} from '@user/types/payment';
import type { JSX } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentTab = 'money_in' | 'money_out';

const STATUS_COLOR: Record<PaymentTransactionStatus, string> = {
  PAID: '#00B14F',
  PENDING: '#f59e0b',
  CANCELLED: '#e66772',
  FAILED: '#9ca3af',
};

const STATUS_I18N_KEY: Record<PaymentTransactionStatus, string> = {
  PAID: 'payment_history.status_paid',
  PENDING: 'payment_history.status_pending',
  CANCELLED: 'payment_history.status_cancelled',
  FAILED: 'payment_history.status_failed',
};

const METHOD_ICON: Record<PaymentMethod, keyof typeof Ionicons.glyphMap> = {
  'QR Code': 'qr-code-outline',
  'Lowca Wallet': 'wallet-outline',
  PAYOS_PAYOUT: 'arrow-up-circle-outline',
};

const getDescription = (
  item: PaymentTransaction,
  t: (key: string, options?: Record<string, unknown>) => string
): string => {
  if (item.paymentMethod === 'PAYOS_PAYOUT') {
    return t('payment_history.desc_payout');
  }
  if (item.amount < 0 && item.orderId !== null) {
    return t('payment_history.desc_wallet_payment', { orderId: item.orderId });
  }
  if (item.amount > 0 && item.orderId !== null) {
    return t('payment_history.desc_wallet_refund', { orderId: item.orderId });
  }
  return t('payment_history.desc_wallet_payment', {
    orderId: item.orderId ?? '',
  });
};

const PaymentHistorySkeleton = (): JSX.Element => (
  <View className="px-4 pt-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <View
        key={`skeleton-${i}`}
        className="mb-3 rounded-2xl border border-gray-200 bg-white p-4"
      >
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
    ))}
  </View>
);

const PaymentTransactionItem = ({
  item,
  onPress,
}: {
  item: PaymentTransaction;
  onPress?: () => void;
}): JSX.Element => {
  const { t } = useTranslation();
  const statusColor = STATUS_COLOR[item.status] ?? '#9ca3af';
  const methodIcon = METHOD_ICON[item.paymentMethod] ?? 'card-outline';
  const isOutgoing = item.amount < 0;

  const statusLabel = t(
    STATUS_I18N_KEY[item.status] ?? 'payment_history.status_pending'
  );

  const methodLabel =
    item.paymentMethod === 'PAYOS_PAYOUT'
      ? t('payment_history.method_payout')
      : isOutgoing
        ? t('payment_history.method_wallet')
        : t('payment_history.method_wallet_refund');

  const description = getDescription(item, t);

  const formattedDate = new Date(item.createdAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="mx-4 mb-3 rounded-2xl border border-gray-200 bg-white p-4"
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name={methodIcon} size={15} color="#6b7280" />
          <Text className="text-sm text-gray-500">{methodLabel}</Text>
        </View>
        <View
          className="rounded-full px-2.5 py-0.5"
          style={{ backgroundColor: `${statusColor}20` }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
        {description}
      </Text>

      {item.transactionCode ? (
        <Text className="mt-1 text-xs text-gray-400">
          {t('payment_history.transaction_code')}: {item.transactionCode}
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

      {item.orderId !== null && onPress ? (
        <View className="mt-2 flex-row items-center justify-end gap-1">
          <Text className="text-xs font-medium text-primary">
            {t('payment_history.view_order')}
          </Text>
          <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export const PaymentHistoryScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const [activeTab, setActiveTab] = useState<PaymentTab>('money_in');
  const { transactions, isLoading, refetch } = usePaymentHistoryQuery();

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
      { key: 'money_in' as const, label: t('payment_history.tab_money_in') },
      { key: 'money_out' as const, label: t('payment_history.tab_money_out') },
    ],
    [t]
  );

  const walletTransactions = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.paymentMethod === 'Lowca Wallet' ||
          tx.paymentMethod === 'PAYOS_PAYOUT'
      ),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'money_in') {
      return walletTransactions.filter((tx) => tx.amount > 0);
    }
    return walletTransactions.filter((tx) => tx.amount < 0);
  }, [walletTransactions, activeTab]);

  const handleTransactionPress = useCallback(
    (tx: PaymentTransaction) => {
      if (tx.orderId === null) return;
      navigation.navigate('OrderStatus', {
        orderId: tx.orderId,
        branchName: '',
        readOnly: true,
      });
    },
    [navigation]
  );

  const renderItem = ({ item }: { item: PaymentTransaction }): JSX.Element => (
    <PaymentTransactionItem
      item={item}
      onPress={
        item.orderId !== null
          ? (): void => handleTransactionPress(item)
          : undefined
      }
    />
  );

  const emptyIcon: keyof typeof Ionicons.glyphMap =
    activeTab === 'money_in'
      ? 'arrow-down-circle-outline'
      : 'arrow-up-circle-outline';

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('payment_history.title')}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReachedThreshold={0.3}
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
            <PaymentHistorySkeleton />
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name={emptyIcon} size={64} color="#ccc" />
              <Text className="mt-4 text-lg font-semibold text-gray-400">
                {t(`payment_history.empty_${activeTab}`)}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoading && filteredTransactions.length > 0 ? (
            <View className="py-4">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};
