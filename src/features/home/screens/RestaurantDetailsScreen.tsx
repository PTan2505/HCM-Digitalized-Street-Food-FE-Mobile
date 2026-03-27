import type { VendorTier } from '@custom-types/vendor';
import { Ionicons } from '@expo/vector-icons';
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
import { useBranchImages } from '@features/home/hooks/useBranchImages';
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
import { queryKeys } from '@lib/queryKeys';
import {
  StaticScreenProps,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { fetchCartThunk, selectCart } from '@slices/directOrdering';
import { useQueryClient } from '@tanstack/react-query';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionSheetIOS,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const cart = useAppSelector(selectCart);
  const queryClient = useQueryClient();

  // Refetch feedback when screen regains focus (e.g. after notification → ReviewList → goBack)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.branch(branch.branchId),
      });
    }, [queryClient, branch.branchId])
  );

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
    feedbackDetails,
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

  const { imageUrls: branchImageUrls } = useBranchImages(branch.branchId);

  useEffect(() => {
    dispatch(fetchCartThunk());
  }, [dispatch]);

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

  const isSharingRef = useRef(false);
  const handleSharePress = (): void => {
    if (isSharingRef.current) return;
    isSharingRef.current = true;

    const stars = '⭐'.repeat(Math.round(branch.avgRating));
    const address = [branch.addressDetail, branch.ward, branch.city]
      .filter(Boolean)
      .join(', ');
    const deepLink =
      Platform.OS === 'android'
        ? `${process.env.EXPO_PUBLIC_WEB_URL}/restaurant/${branch.branchId}`
        : `lowca://restaurant/${branch.branchId}`;
    const infoText = `🍜 ${displayName}\n\n${stars} ${branch.avgRating.toFixed(1)}/5.0\n📍 ${address}`;

    Share.share({
      message:
        Platform.OS === 'android' ? `${infoText}\n\n${deepLink}` : infoText,
      url: Platform.OS === 'ios' ? deepLink : undefined,
    })
      .then((result) => {
        if (result.action === Share.sharedAction) {
          axiosApi.questApi.shareStall(branch.branchId).catch(() => {});
        }
      })
      .finally(() => {
        isSharingRef.current = false;
      });
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

  const restaurantBanners =
    branchImageUrls.length > 0
      ? branchImageUrls.map((url) => ({ uri: url }))
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
      vendorName: branch.vendorName,
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
      <FixedHeaderControls onSharePress={handleSharePress} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderImage images={restaurantBanners} progress={progress} />

        <RestaurantInfo restaurant={restaurantInfo} />

        {/* View on map & Giving direction */}
        <View className="flex-row gap-3 px-4 pb-3">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Map', { initialBranch: branch })
            }
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-[#a1d973] py-2.5"
          >
            <Ionicons name="map-outline" size={18} color="#a1d973" />
            <Text className="text-sm font-semibold text-[#a1d973]">
              {t('actions.view_on_map')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                  {
                    title: t('actions.navigate_to'),
                    options: [
                      t('common.cancel'),
                      t('actions.open_in_apple_maps'),
                      t('actions.open_in_google_maps'),
                    ],
                    cancelButtonIndex: 0,
                  },
                  (index) => {
                    if (index === 1) {
                      Linking.openURL(
                        `maps://app?daddr=${branch.lat},${branch.long}`
                      );
                    } else if (index === 2) {
                      Linking.openURL(
                        `comgooglemaps://?daddr=${branch.lat},${branch.long}&directionsmode=driving`
                      ).catch(() => {
                        Linking.openURL(
                          `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.long}`
                        );
                      });
                    }
                  }
                );
              } else {
                Linking.openURL(
                  `google.navigation:q=${branch.lat},${branch.long}`
                ).catch(() => {
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.long}`
                  );
                });
              }
            }}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#a1d973] py-2.5"
          >
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text className="text-sm font-semibold text-white">
              {t('giving_direction', { defaultValue: 'Chỉ đường' })}
            </Text>
          </TouchableOpacity>
        </View>

        <TabsBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'menu' && (
          <MenuTab
            dishes={branch.dishes}
            branchId={branch.branchId}
            isOpen={isOpen}
            displayName={displayName}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab
            reviews={reviews}
            averageRating={averageRating}
            totalCount={totalCount}
            feedbackDetails={feedbackDetails}
            canReview={canReview && ownFeedback == null}
            reviewIneligibilityReason={reviewIneligibilityReason}
            isEligibilityLoading={isEligibilityLoading}
            ownFeedbackId={ownFeedback?.id}
            branchId={branch.branchId}
            displayName={displayName}
            dishes={branch.dishes}
            branchLat={branch.lat}
            branchLong={branch.long}
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
          className="absolute bottom-6 left-4 right-4 flex-col justify-center rounded-2xl bg-[#a1d973] px-5 py-4 shadow-lg"
        >
          <Text className="text-base font-bold text-white">{displayName}</Text>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-base font-bold text-[#EE6612]">
              {t('cart.items_count', { count: cart.items.length })}
            </Text>
            <Text className="text-base font-bold text-[#EE6612]">
              {`${cart.totalAmount.toLocaleString('vi-VN')}đ`}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};
