import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@constants/colors';
import { ORDER_STATUS } from '@features/direct-ordering/api/cartApi';
import type {
  OrderResponse,
  OrderStatus,
} from '@features/direct-ordering/api/cartApi';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useBranchDisplayName } from '@hooks/useBranchDisplayName';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  fetchOrderHistoryThunk,
  selectOrderHistory,
  selectOrderHistoryLoading,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback } from 'react';
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
  [ORDER_STATUS.Cancelled]: '#9ca3af',
};

const STATUS_KEY_MAP: Record<OrderStatus, string> = {
  [ORDER_STATUS.Pending]: 'pending',
  [ORDER_STATUS.AwaitingVendorConfirmation]: 'awaitingVendorConfirmation',
  [ORDER_STATUS.Paid]: 'paid',
  [ORDER_STATUS.Complete]: 'complete',
  [ORDER_STATUS.Cancelled]: 'cancelled',
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
  return (
    <TouchableOpacity
      onPress={onPress}
      className="border-b border-gray-50 px-4 py-3"
    >
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-black">
          {displayName ?? item.branchName}
        </Text>
        <View
          className="rounded-full px-2.5 py-1"
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
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-xs text-gray-400">
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text className="text-sm font-semibold text-[#00B14F]">
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
  const orderHistory = useAppSelector(selectOrderHistory);
  const isLoading = useAppSelector(selectOrderHistoryLoading);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOrderHistoryThunk({ pageNumber: 1, pageSize: 20 }));
    }, [dispatch])
  );

  const handleLoadMore = useCallback(() => {
    if (orderHistory?.hasNext && !isLoading) {
      dispatch(
        fetchOrderHistoryThunk({
          pageNumber: orderHistory.currentPage + 1,
          pageSize: orderHistory.pageSize,
        })
      );
    }
  }, [dispatch, orderHistory, isLoading]);

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
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-black">
          {t('order.history_title')}
        </Text>
      </View>

      <FlatList
        data={orderHistory?.items ?? []}
        keyExtractor={(item) => String(item.orderId)}
        renderItem={renderOrder}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
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
