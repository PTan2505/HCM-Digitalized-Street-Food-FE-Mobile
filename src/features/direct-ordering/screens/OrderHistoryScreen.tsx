import Header from '@components/Header';
import TabBar from '@components/TabBar';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type {
  OrderResponse,
  OrderStatus,
} from '@features/direct-ordering/api/cartApi';
import { ORDER_STATUS } from '@features/direct-ordering/api/cartApi';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useBranchDisplayName } from '@hooks/useBranchDisplayName';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  fetchOrderHistoryThunk,
  selectOrderHistoryByStatus,
  selectOrderHistoryLoading,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.Pending]: '#f59e0b',
  [ORDER_STATUS.AwaitingVendorConfirmation]: '#3b82f6',
  [ORDER_STATUS.Paid]: '#8b5cf6',
  [ORDER_STATUS.Complete]: COLORS.primary,
  [ORDER_STATUS.Cancelled]: '#e66772',
};

const STATUS_KEY_MAP: Record<OrderStatus, string> = {
  [ORDER_STATUS.Pending]: 'pending',
  [ORDER_STATUS.AwaitingVendorConfirmation]: 'awaitingVendorConfirmation',
  [ORDER_STATUS.Paid]: 'paid',
  [ORDER_STATUS.Complete]: 'complete',
  [ORDER_STATUS.Cancelled]: 'cancelled',
};

type OrderStatusTab = OrderStatus | 'all';

const STATUS_ICON_MAP: Record<OrderStatus, keyof typeof Ionicons.glyphMap> = {
  [ORDER_STATUS.Pending]: 'time-outline',
  [ORDER_STATUS.AwaitingVendorConfirmation]: 'storefront-outline',
  [ORDER_STATUS.Paid]: 'wallet-outline',
  [ORDER_STATUS.Complete]: 'checkmark-circle-outline',
  [ORDER_STATUS.Cancelled]: 'close-circle-outline',
};

const OrderHistorySkeleton = (): JSX.Element => {
  return (
    <View className="px-4 pt-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`order-skeleton-${index}`}
          className="mb-3 rounded-2xl border border-gray-300 bg-white p-4"
        >
          <View className="h-3 w-16 rounded bg-gray-200" />
          <View className="mt-3 h-4 w-40 rounded bg-gray-200" />
          <View className="mt-2 h-3 w-24 rounded bg-gray-100" />
          <View className="mt-4 h-px w-full bg-gray-100" />
          <View className="mt-3 flex-row items-center justify-between">
            <View className="h-3 w-16 rounded bg-gray-100" />
            <View className="h-4 w-20 rounded bg-gray-200" />
          </View>
        </View>
      ))}
    </View>
  );
};

const OrderHistoryItem = ({
  item,
  onPress,
  statusColor,
  statusLabel,
}: {
  item: OrderResponse;
  onPress: () => void;
  statusColor: string;
  statusLabel: string;
}): JSX.Element => {
  const displayName = useBranchDisplayName(item.branchId);
  const { t } = useTranslation();
  const statusIcon = STATUS_ICON_MAP[item.status] ?? 'ellipse-outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-4 mb-3 rounded-2xl border border-gray-300 bg-white p-4"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-400">
          #{item.orderId}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-black"
            numberOfLines={1}
          >
            {displayName ?? item.displayName ?? item.branchName}
          </Text>
          <Text className="mt-1 text-sm text-gray-400">
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View
          className="flex-row items-center rounded-full px-2.5 py-1"
          style={{ backgroundColor: `${statusColor}20` }}
        >
          <Ionicons name={statusIcon} size={12} color={statusColor} />
          <Text
            className="ml-1 text-sm font-semibold"
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-gray-300 pt-3">
        <Text className="text-sm font-medium text-gray-400">
          {t('order.item_count', { count: item.items.length })}
        </Text>
        <Text className="text-base font-semibold text-[#00B14F]">
          {`${item.finalAmount.toLocaleString('vi-VN')}₫`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const OrderHistoryScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const isLoading = useAppSelector(selectOrderHistoryLoading);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusTab>('all');

  const selectedStatusParam: OrderStatus | null =
    selectedStatus === 'all' ? null : selectedStatus;

  const orderHistory = useAppSelector((state) =>
    selectOrderHistoryByStatus(state, selectedStatusParam)
  );

  const statusTabs = useMemo(
    () => [
      { key: 'all' as const, label: t('actions.all') },
      {
        key: ORDER_STATUS.Pending,
        label: t(`order.status.${STATUS_KEY_MAP[ORDER_STATUS.Pending]}`),
      },
      {
        key: ORDER_STATUS.AwaitingVendorConfirmation,
        label: t(
          `order.status.${STATUS_KEY_MAP[ORDER_STATUS.AwaitingVendorConfirmation]}`
        ),
      },
      {
        key: ORDER_STATUS.Paid,
        label: t(`order.status.${STATUS_KEY_MAP[ORDER_STATUS.Paid]}`),
      },
      {
        key: ORDER_STATUS.Complete,
        label: t(`order.status.${STATUS_KEY_MAP[ORDER_STATUS.Complete]}`),
      },
      {
        key: ORDER_STATUS.Cancelled,
        label: t(`order.status.${STATUS_KEY_MAP[ORDER_STATUS.Cancelled]}`),
      },
    ],
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      if (orderHistory) {
        return;
      }

      dispatch(
        fetchOrderHistoryThunk({
          pageNumber: 1,
          pageSize: 20,
          status: selectedStatusParam,
        })
      );
    }, [dispatch, orderHistory, selectedStatusParam])
  );

  const handleLoadMore = useCallback(() => {
    if (
      orderHistory?.hasNext &&
      !isLoading &&
      (orderHistory.items?.length ?? 0) > 0
    ) {
      dispatch(
        fetchOrderHistoryThunk({
          pageNumber: orderHistory.currentPage + 1,
          pageSize: orderHistory.pageSize,
          status: selectedStatusParam,
        })
      );
    }
  }, [dispatch, orderHistory, isLoading, selectedStatusParam]);

  const handleOrderPress = useCallback(
    (order: OrderResponse) => {
      navigation.navigate('OrderStatus', {
        orderId: order.orderId,
        branchName: order.branchName,
        readOnly: true,
      });
    },
    [navigation]
  );

  const renderOrder = ({ item }: { item: OrderResponse }): JSX.Element => {
    const statusColor = STATUS_COLORS[item.status] ?? '#9ca3af';
    return (
      <OrderHistoryItem
        item={item}
        onPress={() => handleOrderPress(item)}
        statusColor={statusColor}
        statusLabel={t(`order.status.${STATUS_KEY_MAP[item.status]}`)}
      />
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('order.history_title')}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={orderHistory?.items ?? []}
        keyExtractor={(item) => String(item.orderId)}
        renderItem={renderOrder}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        ListHeaderComponent={
          <TabBar
            tabs={statusTabs}
            activeTab={selectedStatus}
            onTabChange={setSelectedStatus}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <OrderHistorySkeleton />
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text className="mt-4 text-lg font-semibold text-gray-400">
                {t('order.no_orders')}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoading && orderHistory ? (
            <View className="py-4">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};
