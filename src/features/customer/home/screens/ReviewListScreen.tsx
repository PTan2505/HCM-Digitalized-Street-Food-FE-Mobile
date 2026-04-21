import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReviewCard from '@features/customer/home/components/restaurantDetails/ReviewCard';
import type { Review } from '@features/customer/home/components/restaurantDetails/ReviewCard';
import { ReviewFormModal } from '@features/customer/home/components/ReviewFormModal';
import { useBranchFeedback } from '@features/customer/home/hooks/useBranchFeedback';
import { useCompletedOrdersForBranch } from '@features/customer/home/hooks/useCompletedOrdersForBranch';
import { useOwnBranchFeedback } from '@features/customer/home/hooks/useOwnBranchFeedback';
import { useReviewEligibility } from '@features/customer/home/hooks/useReviewEligibility';
import type { ReviewSortBy } from '@features/customer/home/hooks/useReviewList';
import { useReviewList } from '@features/customer/home/hooks/useReviewList';
import type { Feedback } from '@features/customer/home/types/feedback';
import { queryKeys } from '@lib/queryKeys';
import {
  StaticScreenProps,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

type ReviewListScreenProps = StaticScreenProps<{
  branchId: number;
  displayName: string;
  ownFeedbackId?: number;
  branchLat: number;
  branchLong: number;
}>;

const SORT_OPTIONS: ReviewSortBy[] = [
  'default',
  'most_helpful',
  'highest_rating',
  'lowest_rating',
];

const INELIGIBILITY_MESSAGES: Record<string, string> = {
  permission_denied: 'Cần quyền truy cập vị trí để đánh giá',
  too_far: 'Bạn cần ở gần quán hơn để đánh giá (tối đa 300m)',
  daily_limit_reached: 'Bạn đã đánh giá đủ số quán cho phép hôm nay',
  already_reviewed_branch:
    'Mỗi quán chỉ được đánh giá 1 lần khi không có đơn hàng',
};

export const ReviewListScreen = ({
  route,
}: ReviewListScreenProps): JSX.Element => {
  const { branchId, displayName, branchLat, branchLong } = route.params;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [sortBy, setSortBy] = useState<ReviewSortBy>('default');
  const [showSortModal, setShowSortModal] = useState(false);

  // Refetch reviews when screen regains focus (e.g. after notification navigation)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.list(branchId, sortBy),
      });
    }, [queryClient, branchId, sortBy])
  );
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | undefined>(
    undefined
  );

  // Fetch own feedback for editing
  const { ownFeedback, setOwnFeedback } = useOwnBranchFeedback(branchId);

  // Completed orders → order-based review path
  const {
    hasCompletedOrders,
    firstOrderId,
    isLoading: isOrdersLoading,
  } = useCompletedOrdersForBranch(branchId);

  // Check if user can create a non-order review
  const {
    canReview,
    reason: reviewIneligibilityReason,
    isLoading: isEligibilityLoading,
    userLat,
    userLong,
  } = useReviewEligibility(branchId, branchLat, branchLong, hasCompletedOrders);

  // Fetch reviews with pagination
  const {
    reviews,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    voteFeedback,
    deleteFeedback,
  } = useReviewList({
    branchId,
    sortBy,
    ownFeedbackId: ownFeedback?.id,
  });

  // For updating the branch feedback cache
  const { addFeedback, updateFeedback, removeFeedback } =
    useBranchFeedback(branchId);

  const handleSortChange = useCallback((newSort: ReviewSortBy) => {
    setSortBy(newSort);
    setShowSortModal(false);
  }, []);

  const handleEditOwnReview = useCallback(() => {
    if (ownFeedback) {
      setEditingFeedback(ownFeedback);
      setShowReviewModal(true);
    }
  }, [ownFeedback]);

  const handleWriteReview = useCallback(() => {
    setEditingFeedback(undefined);
    setShowReviewModal(true);
  }, []);

  const handleReviewSuccess = useCallback(
    (feedback: Feedback, isEdit: boolean) => {
      setShowReviewModal(false);
      if (isEdit) {
        updateFeedback(feedback);
      } else {
        addFeedback(feedback);
      }
      setOwnFeedback(feedback);
      // Invalidate the review list cache to refetch with new data
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.list(branchId, sortBy),
      });
    },
    [addFeedback, updateFeedback, setOwnFeedback, queryClient, branchId, sortBy]
  );

  const handleDeleteReview = useCallback(
    (feedbackId: number) => {
      Alert.alert(
        t('review.delete_title', 'Xóa đánh giá'),
        t('review.delete_confirm', 'Bạn có chắc muốn xóa đánh giá này?'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('review.delete', 'Xóa'),
            style: 'destructive',
            onPress: async (): Promise<void> => {
              try {
                await deleteFeedback(feedbackId);
                removeFeedback(feedbackId);
                setOwnFeedback(undefined);
              } catch {
                Alert.alert(
                  t('error_title', 'Lỗi'),
                  t('review.delete_error', 'Không thể xóa đánh giá')
                );
              }
            },
          },
        ]
      );
    },
    [deleteFeedback, removeFeedback, setOwnFeedback, t]
  );

  const handleVoteReview = useCallback(
    (feedbackId: number, voteType: 'up' | 'down') => {
      voteFeedback(feedbackId, voteType);
    },
    [voteFeedback]
  );

  const reviewItems = useMemo<Review[]>(
    () =>
      reviews.map((item) => ({
        id: String(item.id),
        feedbackId: item.id,
        userName: item.user?.name ?? t('user'),
        avatar: item.user?.avatar,
        date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
        time: new Date(item.createdAt).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        rating: item.rating,
        comment: item.comment ?? '',
        imageUris: item.images?.map((img) => img.url) ?? [],
        tags: item.tags?.map((tag) => ({ id: tag.id, name: tag.name })) ?? [],
        isOwn: item.id === ownFeedback?.id,
        editable: item.id === ownFeedback?.id,
        dishName: item.dish?.name,
        upVotes: item.upVotes,
        downVotes: item.downVotes,
        userVote: item.userVote,
        vendorName: displayName,
        vendorReply: item.vendorReply
          ? {
              content: item.vendorReply.content,
              repliedBy: item.vendorReply.repliedBy,
              createdAt: item.vendorReply.createdAt,
            }
          : undefined,
      })),
    [reviews, ownFeedback?.id, t, displayName]
  );

  const renderReviewItem = useCallback(
    ({ item }: { item: Review }) => (
      <View className="px-4 pb-3">
        <ReviewCard
          onEdit={item.isOwn ? handleEditOwnReview : undefined}
          onDelete={item.isOwn ? handleDeleteReview : undefined}
          onVote={handleVoteReview}
          review={item}
        />
      </View>
    ),
    [handleDeleteReview, handleEditOwnReview, handleVoteReview]
  );

  const renderHeader = useMemo(
    () => (
      <View className="px-4 pb-2 pt-3">
        <Text className="text-xl font-bold text-gray-900">{displayName}</Text>
        <Text className="mt-0.5 text-base text-gray-400">
          {t('actions.all_reviews')}
        </Text>
      </View>
    ),
    [displayName, t]
  );

  const renderFooter = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={COLORS.primaryLight} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useMemo(
    () => (
      <View className="flex-1 items-center justify-center px-4 py-12">
        <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
        <Text className="mt-3 text-center text-base text-gray-500">
          {t('search.empty')}
        </Text>
      </View>
    ),
    [t]
  );

  // Can write review when: has completed orders (order path) OR eligible non-order path
  const canWriteReview = hasCompletedOrders || (!ownFeedback && canReview);

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
          <TouchableOpacity
            onPress={(): void => navigation.goBack()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="ml-3 flex-1 text-lg font-semibold text-black">
            {t('actions.all_reviews')}
          </Text>
        </View>

        {/* Error */}
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="mt-3 text-center text-base text-gray-700">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            className="mt-4 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="text-base font-semibold text-white">
              {t('search.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={(): void => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-lg font-semibold text-black">
          {t('actions.all_reviews')}
        </Text>

        {/* Sort Button */}
        <TouchableOpacity
          onPress={(): void => setShowSortModal(true)}
          className="ml-2 flex-row items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2"
        >
          <Ionicons name="swap-vertical" size={16} color="#6B7280" />
          <Text className="text-sm font-medium text-gray-600">
            {t(`review_sort.${sortBy}`)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Review List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={reviewItems}
          keyExtractor={(item): string => item.id}
          renderItem={renderReviewItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={(): void => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Write Review Button — visible for order path OR when no review yet */}
      {(hasCompletedOrders || !ownFeedback) && (
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity
            onPress={handleWriteReview}
            disabled={
              !canWriteReview || isEligibilityLoading || isOrdersLoading
            }
            className={`items-center rounded-xl py-4 shadow-lg ${
              canWriteReview && !isEligibilityLoading && !isOrdersLoading
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          >
            {isEligibilityLoading || isOrdersLoading ? (
              <ActivityIndicator size="small" color={COLORS.primaryLight} />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  canWriteReview ? 'text-white' : 'text-gray-400'
                }`}
              >
                {t('review.write', 'Viết đánh giá')}
              </Text>
            )}
          </TouchableOpacity>
          {!canWriteReview &&
            !isEligibilityLoading &&
            !isOrdersLoading &&
            reviewIneligibilityReason &&
            reviewIneligibilityReason !== 'loading' && (
              <Text className="mt-2 text-center text-sm text-gray-500">
                {INELIGIBILITY_MESSAGES[reviewIneligibilityReason] ??
                  reviewIneligibilityReason}
              </Text>
            )}
        </View>
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={(): void => setShowSortModal(false)}
      >
        <View className="flex-1">
          {/* Backdrop */}
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={(): void => setShowSortModal(false)}
          />

          {/* Modal Content */}
          <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white pb-8 pt-4">
            {/* Handle */}
            <View className="mb-4 items-center">
              <View className="h-1 w-12 rounded-full bg-gray-300" />
            </View>

            {/* Title */}
            <Text className="mb-4 px-4 text-lg font-bold text-black">
              {t('actions.sort_by')}
            </Text>

            {/* Options */}
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={(): void => handleSortChange(option)}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <Text
                  className={`text-base ${
                    sortBy === option
                      ? 'font-bold text-primary-dark'
                      : 'font-medium text-gray-700'
                  }`}
                >
                  {t(`review_sort.${option}`)}
                </Text>
                {sortBy === option && (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={COLORS.primaryLight}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Review Form Modal */}
      <ReviewFormModal
        visible={showReviewModal}
        branchId={branchId}
        existingFeedback={editingFeedback}
        orderId={
          editingFeedback == null && hasCompletedOrders ? firstOrderId : null
        }
        userLat={userLat}
        userLong={userLong}
        onClose={(): void => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
      />
    </SafeAreaView>
  );
};
