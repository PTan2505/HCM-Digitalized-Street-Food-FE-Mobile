import BlankAvatar from '@assets/avatar/blankAvatar.png';
import Header from '@components/Header';
import { Ionicons } from '@expo/vector-icons';
import type { Feedback } from '@features/customer/home/types/feedback';
import { StarRating } from '@features/manager/feedback/components/StarRating';
import {
  useManagerFeedbackAverageRating,
  useManagerFeedbackList,
} from '@features/manager/feedback/hooks/useManagerFeedback';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TFunction } from 'i18next';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterKey = 'all' | 'needs_attention' | 'unreplied';

const formatTimeAgo = (createdAt: string, t: TFunction): string => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('manager_feedback.just_now');
  if (minutes < 60) return `${String(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h`;
  return `${String(Math.floor(hours / 24))}d`;
};

interface FeedbackCardProps {
  item: Feedback;
  onPress: (item: Feedback) => void;
}

const FeedbackCard = ({
  item,
  onPress,
}: FeedbackCardProps): React.JSX.Element => {
  const { t } = useTranslation();
  const isLowRating = item.rating <= 2;
  const isReplied = !!item.vendorReply;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm"
      style={
        isLowRating
          ? { borderLeftWidth: 4, borderLeftColor: '#ef4444' }
          : { borderWidth: 1, borderColor: '#f3f4f6' }
      }
      onPress={() => {
        onPress(item);
      }}
    >
      <View className="p-4">
        {/* Header row */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full`}
            >
              <Image
                source={
                  item.user?.avatar ? { uri: item.user.avatar } : BlankAvatar
                }
                className="h-10 w-10 rounded-full"
              />
            </View>
            <View>
              <Text className="text-sm font-bold text-gray-900">
                {item.user?.name ?? '—'}
              </Text>
              <Text className="text-xs text-gray-400">
                {formatTimeAgo(item.createdAt, t)}
              </Text>
            </View>
          </View>
          <View className="items-center">
            <StarRating rating={item.rating} size="sm" />
            {/* Votes */}
            <View className="mt-3 flex-row items-center gap-4 pt-3">
              <View className="flex-row items-center gap-1">
                <Ionicons name="thumbs-up" size={16} color="#9FD356" />
                <Text className="text-sm font-semibold text-primary">
                  {item.upVotes}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="thumbs-down" size={16} color="#f87171" />
                <Text className="text-sm font-semibold text-red-400">
                  {item.downVotes}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Comment */}
        {item.comment ? (
          <Text
            className="mb-3 text-sm leading-relaxed text-gray-700"
            numberOfLines={3}
          >
            {item.comment}
          </Text>
        ) : (
          <Text className="mb-3 text-sm italic text-gray-300">
            {t('manager_feedback.no_comment')}
          </Text>
        )}

        {/* Tags */}
        {(item.tags?.length ?? 0) > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {item.tags?.map((tag) => (
              <View
                key={tag.id}
                className="rounded-full bg-green-100 px-3 py-1"
              >
                <Text className="text-xs font-semibold text-green-800">
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
          {isLowRating && !isReplied ? (
            <View className="flex-row items-center gap-1">
              <Text className="text-xs font-semibold text-red-500">⚠</Text>
              <Text className="text-xs font-semibold text-red-500">
                {t('manager_feedback.no_reply')}
              </Text>
            </View>
          ) : isReplied ? (
            <View className="rounded-full bg-green-50 px-3 py-1">
              <Text className="text-xs font-semibold text-green-700">
                ✓ {t('manager_feedback.replied')}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            className={`rounded-full px-4 py-2 ${isLowRating && !isReplied ? 'bg-orange-100' : 'bg-gray-100'}`}
            onPress={() => {
              onPress(item);
            }}
          >
            <Text
              className={`text-sm font-semibold ${isLowRating && !isReplied ? 'text-orange-700' : 'text-gray-600'}`}
            >
              {isReplied
                ? t('manager_feedback.edit_reply')
                : t('manager_feedback.reply')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ManagerFeedbackScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const {
    items,
    totalCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNext,
    loadMore,
    refresh,
  } = useManagerFeedbackList();

  const avgRating = useManagerFeedbackAverageRating();

  const filteredItems = useMemo<Feedback[]>(() => {
    switch (activeFilter) {
      case 'needs_attention':
        return items.filter((f) => f.rating <= 2);
      case 'unreplied':
        return items.filter((f) => !f.vendorReply);
      default:
        return items;
    }
  }, [items, activeFilter]);

  const handleCardPress = useCallback(
    (item: Feedback): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).navigate('ManagerFeedbackDetail', {
        feedbackId: item.id,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Feedback }) => (
      <FeedbackCard item={item} onPress={handleCardPress} />
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: Feedback) => String(item.id), []);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: t('manager_feedback.filter_all') },
    {
      key: 'needs_attention',
      label: t('manager_feedback.filter_needs_attention'),
    },
    { key: 'unreplied', label: t('manager_feedback.filter_unreplied') },
  ];

  const StatsHeader = (
    <View>
      {/* Stats cards */}
      <View className="mb-4 flex-row gap-3 px-4">
        <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <Text className="mb-1 text-xs font-medium text-gray-500">
            ★ {t('manager_feedback.avg_rating')}
          </Text>
          <Text className="text-2xl font-extrabold text-primary">
            {avgRating !== null ? avgRating.toFixed(1) : '—'}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <Text className="mb-1 text-xs font-medium text-gray-500">
            💬 {t('manager_feedback.total_reviews')}
          </Text>
          <Text className="text-2xl font-extrabold text-gray-900">
            {totalCount}
          </Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 8,
        }}
      >
        {FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            activeOpacity={0.8}
            className={`rounded-full px-5 py-2 ${activeFilter === key ? 'bg-primary' : 'border border-gray-200 bg-white'}`}
            onPress={() => {
              setActiveFilter(key);
            }}
          >
            <Text
              className={`text-sm font-semibold ${activeFilter === key ? 'text-white' : 'text-gray-500'}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ListEmpty = isLoading ? null : (
    <View className="flex-1 items-center justify-center pt-16">
      <Text className="mb-1 text-base font-bold text-gray-400">
        {t('manager_feedback.empty')}
      </Text>
      <Text className="text-sm font-normal text-gray-300">
        {t('manager_feedback.empty_subtitle')}
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
      <Header title={t('manager_feedback.title')} />
      {isLoading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={StatsHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 24,
            flexGrow: 1,
          }}
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
