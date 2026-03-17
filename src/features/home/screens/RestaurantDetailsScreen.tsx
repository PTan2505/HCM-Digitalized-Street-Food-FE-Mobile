import type { VendorTier } from '@custom-types/vendor';
import type { RestaurantInfoData } from '@features/home/components/common/RestaurantInfo';
import RestaurantInfo from '@features/home/components/common/RestaurantInfo';
import { ReviewFormModal } from '@features/home/components/ReviewFormModal';
import FixedHeaderControls from '@features/home/components/restaurantDetails/FixedHeaderControls';
import HeaderImage from '@features/home/components/restaurantDetails/HeaderImage';
import MenuTab from '@features/home/components/restaurantDetails/MenuTab';
import type { NearbyRestaurant } from '@features/home/components/restaurantDetails/RestaurantsMayLikeTab';
import RestaurantsMayLikeTab from '@features/home/components/restaurantDetails/RestaurantsMayLikeTab';
import type { Review } from '@features/home/components/restaurantDetails/ReviewsTab';
import ReviewsTab from '@features/home/components/restaurantDetails/ReviewsTab';
import type { TabType } from '@features/home/components/restaurantDetails/TabsBar';
import TabsBar from '@features/home/components/restaurantDetails/TabsBar';
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
import { StaticScreenProps } from '@react-navigation/native';
import { fetchBranchAllImages, selectBranchImageMap } from '@slices/branches';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200';

type RestaurantDetailsScreenProps = StaticScreenProps<{
  branch: ActiveBranch;
  displayName: string;
  tab?: TabType;
}>;

export const RestaurantDetailsScreen = ({
  route,
}: RestaurantDetailsScreenProps): JSX.Element => {
  const { branch, displayName, tab } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>(tab ?? 'menu');
  const progress = useSharedValue<number>(0);

  const dispatch = useAppDispatch();
  const branchImageMap = useAppSelector(selectBranchImageMap);

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
    refetch: refetchFeedback,
  } = useBranchFeedback(branch.branchId);
  const { ownFeedback, refetch: refetchOwnFeedback } = useOwnBranchFeedback(
    branch.branchId
  );
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
      axiosApi.feedbackApi
        .deleteFeedback(feedbackId)
        .then(() => {
          refetchFeedback();
          refetchOwnFeedback();
          refetchVelocity();
        })
        .catch(() => {
          Alert.alert('Lỗi', 'Không thể xoá đánh giá. Vui lòng thử lại.');
        });
    },
    [refetchFeedback, refetchOwnFeedback, refetchVelocity]
  );

  const handleEditReview = useCallback(() => {
    setEditingFeedback(ownFeedback);
    setShowReviewModal(true);
  }, [ownFeedback]);

  const handleOpenWriteReview = (): void => {
    setEditingFeedback(undefined);
    setShowReviewModal(true);
  };

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
      isOwn: f.id === ownFeedback?.id,
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

        {activeTab === 'menu' && <MenuTab dishes={branch.dishes} />}

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
        onSuccess={() => {
          setShowReviewModal(false);
          refetchFeedback();
          refetchOwnFeedback();
          refetchVelocity();
        }}
      />
    </SafeAreaView>
  );
};
