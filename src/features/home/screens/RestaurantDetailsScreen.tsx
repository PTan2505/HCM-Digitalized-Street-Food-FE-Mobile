import type { VendorTier } from '@custom-types/vendor';
import type { RestaurantInfoData } from '@features/home/components/common/RestaurantInfo';
import RestaurantInfo from '@features/home/components/common/RestaurantInfo';
import FixedHeaderControls from '@features/home/components/restaurantDetails/FixedHeaderControls';
import HeaderImage from '@features/home/components/restaurantDetails/HeaderImage';
import MenuTab from '@features/home/components/restaurantDetails/MenuTab';
import type { NearbyRestaurant } from '@features/home/components/restaurantDetails/RestaurantsMayLikeTab';
import RestaurantsMayLikeTab from '@features/home/components/restaurantDetails/RestaurantsMayLikeTab';
import type { Review } from '@features/home/components/restaurantDetails/ReviewsTab';
import ReviewsTab from '@features/home/components/restaurantDetails/ReviewsTab';
import type { TabType } from '@features/home/components/restaurantDetails/TabsBar';
import TabsBar from '@features/home/components/restaurantDetails/TabsBar';
import { ReviewFormModal } from '@features/home/components/ReviewFormModal';
import { useBranchFeedback } from '@features/home/hooks/useBranchFeedback';
import { useNearbyBranches } from '@features/home/hooks/useNearbyBranches';
import { useOwnBranchFeedback } from '@features/home/hooks/useOwnBranchFeedback';
import { useReviewEligibility } from '@features/home/hooks/useReviewEligibility';
import { useWorkSchedule } from '@features/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/home/types/branch';
import type { Feedback } from '@features/home/types/feedback';
import { getLowcaAPIUnimplementedEndpoints } from '@features/reputation/api/generated';
import type { BranchTier } from '@features/reputation/types/generated';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { fetchBranchAllImages, selectBranchImageMap } from '@slices/branches';
import { fetchCartThunk, selectCart } from '@slices/directOrdering';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200';

type RestaurantDetailsScreenProps = StaticScreenProps<{
  branch: ActiveBranch;
  displayName: string;
  tab?: TabType;
  onRatingUpdate?: (avgRating: number, totalReviewCount: number) => void;
}>;

export const RestaurantDetailsScreen = ({
  route,
}: RestaurantDetailsScreenProps): JSX.Element => {
  const { branch, displayName, tab, onRatingUpdate } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>(tab ?? 'menu');
  const progress = useSharedValue<number>(0);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const dispatch = useAppDispatch();
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const cart = useAppSelector(selectCart);

  const [branchTier, setBranchTier] = useState<BranchTier | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | undefined>(
    undefined
  );

  const { isOpen, schedules } = useWorkSchedule(branch.branchId);
  const {
    feedbacks,
    averageRating,
    totalCount,
    addFeedback,
    updateFeedback,
    removeFeedback,
  } = useBranchFeedback(branch.branchId);
  const { ownFeedback, setOwnFeedback } = useOwnBranchFeedback(branch.branchId);
  const {
    canReview,
    reason: reviewIneligibilityReason,
    isLoading: isEligibilityLoading,
    refetchVelocity,
  } = useReviewEligibility(branch.branchId, branch.lat, branch.long);
  const { branches: nearbyBranches } = useNearbyBranches(
    branch.lat,
    branch.long,
    branch.branchId
  );

  useEffect(() => {
    dispatch(fetchBranchAllImages(branch.branchId));
    dispatch(fetchCartThunk());
  }, [branch.branchId, dispatch]);

  useEffect(() => {
    const { getBranchTier } = getLowcaAPIUnimplementedEndpoints();
    getBranchTier(String(branch.branchId))
      .then(setBranchTier)
      .catch(() => {});
  }, [branch.branchId]);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const handleDeleteReview = useCallback(
    (feedbackId: number) => {
      const deletedFeedback = feedbacks.find((f) => f.id === feedbackId);
      if (!deletedFeedback) return;

      axiosApi.feedbackApi
        .deleteFeedback(feedbackId)
        .then(() => {
          removeFeedback(feedbackId);
          setOwnFeedback(undefined);
          refetchVelocity();

          // Recalculate rating after deletion
          if (totalCount > 1) {
            const newCount = totalCount - 1;
            const newAvg =
              (averageRating * totalCount - deletedFeedback.rating) / newCount;
            onRatingUpdate?.(newAvg, newCount);
          } else {
            // If this was the only review, reset to 0
            onRatingUpdate?.(0, 0);
          }
        })
        .catch(() => {
          Alert.alert('Lỗi', 'Không thể xoá đánh giá. Vui lòng thử lại.');
        });
    },
    [
      feedbacks,
      removeFeedback,
      setOwnFeedback,
      refetchVelocity,
      averageRating,
      totalCount,
      onRatingUpdate,
    ]
  );

  const handleEditReview = useCallback(() => {
    setEditingFeedback(ownFeedback);
    setShowReviewModal(true);
  }, [ownFeedback]);

  const handleOpenWriteReview = (): void => {
    setEditingFeedback(undefined);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = useCallback(
    (feedback: Feedback, isEdit: boolean) => {
      setShowReviewModal(false);
      if (isEdit) {
        updateFeedback(feedback);
        const oldRating = ownFeedback?.rating ?? feedback.rating;
        const newAvg =
          (averageRating * totalCount - oldRating + feedback.rating) /
          totalCount;
        onRatingUpdate?.(newAvg, totalCount);
      } else {
        addFeedback(feedback);
        refetchVelocity();
        const newCount = totalCount + 1;
        const newAvg =
          (averageRating * totalCount + feedback.rating) / newCount;
        onRatingUpdate?.(newAvg, newCount);
      }
      setOwnFeedback(feedback);
    },
    [
      addFeedback,
      updateFeedback,
      setOwnFeedback,
      refetchVelocity,
      averageRating,
      totalCount,
      ownFeedback,
      onRatingUpdate,
    ]
  );

  const handleVoteReview = useCallback(
    (feedbackId: number, voteType: 'up' | 'down') => {
      const feedback = feedbacks.find((f) => f.id === feedbackId);
      if (!feedback) return;

      // Optimistic update
      const isSameVote = feedback.userVote === voteType;
      const optimistic = { ...feedback };
      if (isSameVote) {
        // Toggle off
        optimistic.userVote = null;
        if (voteType === 'up') optimistic.upVotes -= 1;
        else optimistic.downVotes -= 1;
      } else {
        // Undo previous vote if any
        if (feedback.userVote === 'up') optimistic.upVotes -= 1;
        if (feedback.userVote === 'down') optimistic.downVotes -= 1;
        // Apply new vote
        optimistic.userVote = voteType;
        if (voteType === 'up') optimistic.upVotes += 1;
        else optimistic.downVotes += 1;
      }
      updateFeedback(optimistic);

      axiosApi.feedbackApi
        .voteFeedback(feedbackId, isSameVote ? voteType : voteType)
        .then((res) => {
          updateFeedback({
            ...feedback,
            upVotes: res.upVotes,
            downVotes: res.downVotes,
            userVote: res.userVote,
          });
        })
        .catch(() => {
          // Revert on failure
          updateFeedback(feedback);
        });
    },
    [feedbacks, updateFeedback]
  );

  const rawImageUrls = branchImageMap[branch.branchId] ?? [];
  const restaurantBanners =
    rawImageUrls.length > 0
      ? rawImageUrls.map((url) => ({ uri: url }))
      : [{ uri: PLACEHOLDER_IMAGE }];

  const restaurantInfo: RestaurantInfoData = {
    name: displayName,
    priceRange: getPriceRange(branch.dishes),
    rating: averageRating,
    totalReviewCount: totalCount,
    isVegetarian: false,
    dietaryPreferenceNames: branch.dietaryPreferenceNames,
    address: [branch.addressDetail, branch.ward, branch.city]
      .filter(Boolean)
      .join(', '),
    isOpen,
    schedules,
    tier: branchTier?.tier as VendorTier | undefined,
    isTierPaused: branchTier?.isBombingShieldActive,
  };

  const reviews: Review[] = feedbacks.map((f): Review => {
    const dishName = branch.dishes.find((d) => d.dishId === f.dishId)?.name;
    const createdAt = new Date(f.createdAt);
    return {
      id: String(f.id),
      feedbackId: f.id,
      userName: f.user?.name ?? '',
      avatar: f.user?.avatar,
      date: createdAt.toLocaleDateString('vi-VN'),
      time: createdAt.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      rating: f.rating,
      comment: f.comment ?? '',
      imageUris: f.images?.map((img) => img.url) ?? [],
      tags: f.tags?.map((tag) => ({ id: tag.id, name: tag.name })) ?? [],
      isOwn: f.id === ownFeedback?.id,
      dishName: dishName,
      upVotes: f.upVotes,
      downVotes: f.downVotes,
      userVote: f.userVote,
      vendorReply: f.vendorReply
        ? {
            content: f.vendorReply.content,
            repliedBy: f.vendorReply.repliedBy,
            createdAt: f.vendorReply.createdAt,
          }
        : undefined,
    };
  });

  const nearbyRestaurants: NearbyRestaurant[] = nearbyBranches.map((b) => ({
    id: String(b.branchId),
    name: b.name,
    rating: b.avgRating,
    distance: b.distanceKm != null ? `${b.distanceKm.toFixed(1)} km` : '',
    priceRange: getPriceRange(b.dishes),
    imageUri: b.dishes[0]?.imageUrl,
  }));

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1">
      <FixedHeaderControls />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderImage images={restaurantBanners} progress={progress} />

        <RestaurantInfo restaurant={restaurantInfo} />

        <TabsBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'menu' && (
          <MenuTab
            dishes={branch.dishes}
            branchId={branch.branchId}
            isOpen={isOpen}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab
            reviews={reviews}
            averageRating={averageRating}
            totalCount={totalCount}
            canReview={canReview && ownFeedback == null}
            reviewIneligibilityReason={reviewIneligibilityReason}
            isEligibilityLoading={isEligibilityLoading}
            ownFeedbackId={ownFeedback?.id}
            onWriteReview={handleOpenWriteReview}
            onEditOwnReview={handleEditReview}
            onDeleteReview={handleDeleteReview}
            onVoteReview={handleVoteReview}
          />
        )}

        {activeTab === 'nearby' && (
          <RestaurantsMayLikeTab restaurants={nearbyRestaurants} />
        )}
      </ScrollView>

      <ReviewFormModal
        visible={showReviewModal}
        branchId={branch.branchId}
        dishes={branch.dishes}
        existingFeedback={editingFeedback}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
      />

      {cart && cart.items.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('PersonalCart', {
              branchName: displayName,
              isOpen,
            })
          }
          className="absolute bottom-6 left-4 right-4 flex-row items-center justify-between rounded-2xl bg-[#a1d973] px-5 py-4 shadow-lg"
        >
          <Text className="text-base font-bold text-white">
            {t('cart.items_count', { count: cart.items.length })}
          </Text>
          <Text className="text-base font-bold text-white">
            {`${Math.round(cart.totalAmount / 1000)}k`}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};
