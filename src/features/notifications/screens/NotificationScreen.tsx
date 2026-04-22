import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { NotificationDto } from '@features/notifications/types/notification';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  selectNotifications,
  selectNotificationsHasMore,
  selectNotificationsLoadingMore,
  selectNotificationsPage,
  selectNotificationsStatus,
  selectUnreadCount,
} from '@slices/notifications';
import type { JSX } from 'react';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_SIZE = 20;

const formatTimeAgo = (
  dateString: string,
  t: (key: string) => string
): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('notification.just_now');
  if (diffMins < 60) return `${diffMins} ${t('notification.minutes_ago')}`;
  if (diffHours < 24) return `${diffHours} ${t('notification.hours_ago')}`;
  return `${diffDays} ${t('notification.days_ago')}`;
};

const getNotificationIcon = (
  type: string
): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  switch (type) {
    case 'VendorReply':
      return { name: 'chatbubble-outline', color: '#3B82F6' };
    case 'OrderStatusUpdate':
      return { name: 'receipt-outline', color: '#F59E0B' };
    case 'NewFeedback':
      return { name: 'star-outline', color: '#10B981' };
    case 'QuestTaskCompleted':
    case 'QuestCompleted':
      return { name: 'trophy-outline', color: COLORS.primary };
    default:
      return { name: 'notifications-outline', color: '#6B7280' };
  }
};

export const NotificationScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const notifications = useAppSelector(selectNotifications);
  const status = useAppSelector(selectNotificationsStatus);
  const hasMore = useAppSelector(selectNotificationsHasMore);
  const page = useAppSelector(selectNotificationsPage);
  const loadingMore = useAppSelector(selectNotificationsLoadingMore);
  const unreadCount = useAppSelector(selectUnreadCount);

  useEffect(() => {
    void dispatch(fetchNotifications({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    void dispatch(fetchNotifications({ page: page + 1, pageSize: PAGE_SIZE }));
  }, [dispatch, hasMore, loadingMore, page]);

  const handleRefresh = useCallback(() => {
    void dispatch(fetchNotifications({ page: 1, pageSize: PAGE_SIZE }));
  }, [dispatch]);

  const handleMarkAllRead = useCallback(() => {
    if (unreadCount === 0) return;
    void dispatch(markAllNotificationsRead());
  }, [dispatch, unreadCount]);

  const handleNotificationPress = useCallback(
    (item: NotificationDto) => {
      if (!item.isRead) {
        void dispatch(markNotificationRead(item.notificationId));
      }

      if (item.referenceId) {
        switch (item.type) {
          case 'OrderStatusUpdate':
            navigation.navigate('OrderStatus', {
              orderId: item.referenceId,
              branchName: '',
              readOnly: true,
            });
            break;
          case 'QuestTaskCompleted':
            // referenceId is questTaskId — resolve to questId first
            void axiosApi.questApi
              .getQuestTaskById(item.referenceId)
              .then((task) => {
                navigation.navigate('QuestDetail', { questId: task.questId });
              })
              .catch(() => {});
            break;
          case 'QuestCompleted':
            navigation.navigate('QuestDetail', { questId: item.referenceId });
            break;
          case 'VendorReply':
            // referenceId is feedbackId — fetch feedback → branch → vendor for full data
            void axiosApi.feedbackApi
              .getFeedback(item.referenceId)
              .then((feedback) => {
                if (!feedback.branchId) {
                  console.warn(
                    '[NotificationScreen] feedback.branchId is missing'
                  );
                  return;
                }
                return axiosApi.branchApi
                  .getBranchById(feedback.branchId)
                  .then(async (detail) => {
                    let displayName: string;
                    if (detail.vendorId != null) {
                      const [vendor, vendorBranches] = await Promise.all([
                        axiosApi.vendorApi.getVendorById(detail.vendorId),
                        axiosApi.branchApi.getBranchesByVendor(detail.vendorId),
                      ]);
                      displayName =
                        vendorBranches.totalCount > 1
                          ? `${vendor.name} - ${t('branch')} ${detail.name}`
                          : vendor.name;
                    } else {
                      displayName = detail.name;
                    }
                    navigation.navigate('ReviewList', {
                      branchId: detail.branchId,
                      displayName,
                      branchLat: detail.lat,
                      branchLong: detail.long,
                    });
                  });
              })
              .catch((err: unknown) => {
                console.warn(
                  '[NotificationScreen] VendorReply fetch failed:',
                  err
                );
              });
            break;
          default:
            break;
        }
      }
    },
    [dispatch, navigation, t]
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationDto }) => {
      const icon = getNotificationIcon(item.type);
      return (
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          className={`flex-row items-start border-b border-gray-100 px-4 py-3 ${
            !item.isRead ? 'bg-green-50' : 'bg-white'
          }`}
          activeOpacity={0.7}
        >
          <View
            className="mr-3 mt-1 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${icon.color}15` }}
          >
            <Ionicons name={icon.name} size={20} color={icon.color} />
          </View>
          <View className="flex-1">
            <Text
              className={`text-base ${!item.isRead ? 'font-bold' : 'font-medium'} text-gray-800`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={2}>
              {item.message}
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              {formatTimeAgo(item.createdAt, t)}
            </Text>
          </View>
          {!item.isRead && (
            <View className="ml-2 mt-2 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </TouchableOpacity>
      );
    },
    [handleNotificationPress, t]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          {t('notification.title')}
        </Text>
        <TouchableOpacity
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <Text
            className={`text-base font-medium ${unreadCount > 0 ? 'text-primary' : 'text-gray-300'}`}
          >
            {t('notification.mark_all_read')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {status === 'pending' ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.notificationId)}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshing={false}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-20">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#D1D5DB"
              />
              <Text className="mt-4 text-center text-base text-gray-400">
                {t('notification.empty')}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="items-center py-4">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};
