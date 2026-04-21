import Header from '@components/Header';
import TabBar from '@components/TabBar';
import type { User } from '@custom-types/user';
import {
  MANAGER_ORDER_STATUS,
  type ManagerOrderSummary,
} from '@features/manager/orders/api/managerOrderApi';
import { OrderStatusBadge } from '@features/manager/orders/components/OrderStatusBadge';
import {
  useManagerOrdersList,
  useManagerStatusCounts,
} from '@features/manager/orders/hooks/useManagerOrders';
import { useNewOrderNotification } from '@features/manager/orders/hooks/useNewOrderNotification';
import { axiosApi } from '@lib/api/apiInstance';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
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

const STATUS_TABS = [
  MANAGER_ORDER_STATUS.AwaitingVendorConfirmation,
  MANAGER_ORDER_STATUS.Paid,
  MANAGER_ORDER_STATUS.Complete,
] as const;

// Module-level cache to avoid re-fetching the same user across card re-renders
const userNameCache = new Map<number, string>();

const formatTimeAgo = (createdAt: string): string => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${String(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h`;
  return `${String(Math.floor(hours / 24))}d`;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

const getUserDisplayName = (user: User): string => {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return user.username ?? user.email ?? '—';
};

interface OrderCardProps {
  order: ManagerOrderSummary;
  onPress: (order: ManagerOrderSummary) => void;
}

const OrderCard = ({ order, onPress }: OrderCardProps): React.JSX.Element => {
  const { t } = useTranslation();
  const isPending =
    order.status === MANAGER_ORDER_STATUS.AwaitingVendorConfirmation;

  const [customerName, setCustomerName] = useState<string>(() => {
    if (order.userId != null && userNameCache.has(order.userId)) {
      return userNameCache.get(order.userId) ?? '—';
    }
    return order.displayName ?? '—';
  });

  useEffect(() => {
    if (order.userId == null) return;
    if (userNameCache.has(order.userId)) {
      setCustomerName(userNameCache.get(order.userId) ?? '—');
      return;
    }
    let cancelled = false;
    axiosApi.userProfileApi
      .getUserById(order.userId)
      .then((user) => {
        if (cancelled) return;
        const name = getUserDisplayName(user);
        userNameCache.set(order.userId as number, name);
        setCustomerName(name);
      })
      .catch(() => {
        // keep displayName fallback
      });
    return (): void => {
      cancelled = true;
    };
  }, [order.userId, order.displayName]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className={`mx-4 rounded-2xl bg-white p-4 shadow-sm ${isPending ? 'border-l-4 border-l-secondary' : 'border border-gray-100'}`}
      onPress={() => {
        onPress(order);
      }}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <OrderStatusBadge status={order.status} />
          <Text className="mt-1 text-base font-bold text-gray-900">
            #{order.orderId}
          </Text>
          <Text className="text-sm font-medium text-gray-500" numberOfLines={1}>
            {customerName}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-extrabold text-gray-900">
            {formatCurrency(order.finalAmount)}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-400">
            {formatTimeAgo(order.createdAt)}
          </Text>
        </View>
      </View>

      <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-2">
        <Text className="text-xs font-medium text-gray-500">
          {t('manager_orders.items_count', { count: order.items.length })}
        </Text>
        <Text className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
          {order.isTakeAway
            ? t('manager_orders.takeaway')
            : t('manager_orders.dine_in')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ManagerOrdersScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const [activeStatus, setActiveStatus] = useState<number>(
    MANAGER_ORDER_STATUS.AwaitingVendorConfirmation
  );

  const {
    items,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNext,
    loadMore,
    refresh,
  } = useManagerOrdersList(activeStatus);
  const statusCounts = useManagerStatusCounts(STATUS_TABS);

  const pendingRefresh = useManagerOrdersList(
    MANAGER_ORDER_STATUS.AwaitingVendorConfirmation
  ).refresh;

  useNewOrderNotification(
    useCallback((): void => {
      pendingRefresh();
    }, [pendingRefresh])
  );

  const handleTabChange = useCallback(
    (status: number) => {
      if (status === activeStatus) return;
      setActiveStatus(status);
    },
    [activeStatus]
  );

  const handleOrderPress = useCallback(
    (order: ManagerOrderSummary): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).navigate('ManagerOrderDetail', {
        orderId: order.orderId,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: ManagerOrderSummary }) => (
      <OrderCard order={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress]
  );

  const keyExtractor = useCallback(
    (item: ManagerOrderSummary) => String(item.orderId),
    []
  );

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case MANAGER_ORDER_STATUS.AwaitingVendorConfirmation:
        return t('manager_orders.status_pending');
      case MANAGER_ORDER_STATUS.Paid:
        return t('manager_orders.status_preparing');
      case MANAGER_ORDER_STATUS.Complete:
        return t('manager_orders.status_completed');
      default:
        return String(status);
    }
  };

  const pendingCount =
    statusCounts[MANAGER_ORDER_STATUS.AwaitingVendorConfirmation];
  const paidCount = statusCounts[MANAGER_ORDER_STATUS.Paid];

  const QuickStats = (
    <View>
      {/* Quick Stats */}
      {(pendingCount !== undefined || paidCount !== undefined) && (
        <View className="mb-4 flex-row gap-3 px-4">
          {pendingCount !== undefined && (
            <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <Text className="mb-1 text-xs font-medium text-gray-500">
                {t('manager_orders.status_pending')}
              </Text>
              <Text className="text-2xl font-extrabold text-secondary">
                {pendingCount}
              </Text>
            </View>
          )}
          {paidCount !== undefined && (
            <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <Text className="mb-1 text-xs font-medium text-gray-500">
                {t('manager_orders.status_preparing')}
              </Text>
              <Text className="text-2xl font-extrabold text-primary">
                {paidCount}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const ListEmpty = isLoading ? null : (
    <View className="flex-1 items-center justify-center pt-16">
      <Text className="mb-1 text-base font-bold text-gray-400">
        {t('manager_orders.empty')}
      </Text>
      <Text className="text-sm font-normal text-gray-300">
        {t('manager_orders.empty_subtitle')}
      </Text>
    </View>
  );

  const ListFooter = isLoadingMore ? (
    <View className="items-center py-4">
      <ActivityIndicator size="small" color="#9FD356" />
    </View>
  ) : null;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-gray-50">
      <Header title={t('manager_orders.title')} />
      {/* Status Filter Tabs */}
      <TabBar
        tabs={STATUS_TABS.map((status) => ({
          key: status,
          label: getStatusLabel(status),
        }))}
        activeTab={activeStatus}
        onTabChange={handleTabChange}
        tabCount={(status) => statusCounts[status] ?? 0}
        variant="equal"
      />
      {QuickStats}
      {isLoading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          ItemSeparatorComponent={(): React.JSX.Element => (
            <View className="h-3" />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor="#9FD356"
              colors={['#9FD356']}
            />
          }
          onEndReached={
            hasNext
              ? (): void => {
                  loadMore();
                }
              : undefined
          }
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};
