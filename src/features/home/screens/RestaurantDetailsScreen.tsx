import TabBar from '@components/TabBar';
import { COLORS } from '@constants/colors';
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
import { ReviewFormModal } from '@features/home/components/ReviewFormModal';
import { useBranchDishes } from '@features/home/hooks/useBranchDishes';
import { useBranchFeedback } from '@features/home/hooks/useBranchFeedback';
import { useBranchImages } from '@features/home/hooks/useBranchImages';
import { useFavoriteBranches } from '@features/home/hooks/useFavoriteBranches';
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
import {
  computeDisplayName,
  selectMultiBranchVendorIds,
} from '@slices/branches';
import {
  fetchCartThunk,
  selectCart,
  selectCartDisplayName,
} from '@slices/directOrdering';
import { useQueryClient } from '@tanstack/react-query';
import { invokeCallback, removeCallback } from '@utils/callbackRegistry';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
export type TabType = 'menu' | 'reviews' | 'nearby';

import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200';

type RestaurantDetailsScreenProps = StaticScreenProps<{
  branch: ActiveBranch;
  displayName: string;
  tab?: TabType;
  onRatingUpdateId?: string;
}>;

export const RestaurantDetailsScreen = ({
  route,
}: RestaurantDetailsScreenProps): JSX.Element => {
  const { branch, displayName, tab, onRatingUpdateId } = route.params;

  useEffect(() => {
    return (): void => {
      if (onRatingUpdateId) removeCallback(onRatingUpdateId);
    };
  }, [onRatingUpdateId]);

  const onRatingUpdate = useCallback(
    (avgRating: number, totalReviewCount: number): void => {
      if (onRatingUpdateId)
        invokeCallback(onRatingUpdateId, avgRating, totalReviewCount);
    },
    [onRatingUpdateId]
  );
  const [activeTab, setActiveTab] = useState<TabType>(tab ?? 'menu');
  const progress = useSharedValue<number>(0);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const detailTabs = useMemo(
    () => [
      {
        key: 'menu' as const,
        label: t('tabs.menu'),
        icon: ({
          color,
        }: {
          isActive: boolean;
          color: string;
        }): JSX.Element => (
          <Ionicons name="restaurant-outline" size={20} color={color} />
        ),
      },
      {
        key: 'reviews' as const,
        label: t('tabs.reviews'),
        icon: ({
          color,
        }: {
          isActive: boolean;
          color: string;
        }): JSX.Element => (
          <Ionicons name="chatbubble-outline" size={20} color={color} />
        ),
      },
      {
        key: 'nearby' as const,
        label: t('tabs.nearby'),
        icon: ({
          color,
        }: {
          isActive: boolean;
          color: string;
        }): JSX.Element => (
          <Ionicons name="ticket-outline" size={20} color={color} />
        ),
      },
    ],
    [t]
  );

  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const cartDisplayName = useAppSelector(selectCartDisplayName);
  const multiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);
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

  const { isFavorite, toggleFavorite } = useFavoriteBranches();

  const { isOpen, schedules } = useWorkSchedule(branch.branchId);
  const { dishes } = useBranchDishes(branch.branchId);
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
            onRatingUpdate(newAvg, newCount);
          } else {
            // If this was the only review, reset to 0
            onRatingUpdate(0, 0);
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
    const webLink = `${process.env.EXPO_PUBLIC_WEB_URL}/restaurant/${branch.branchId}`;
    const infoText = `🍜 ${displayName}\n\n${stars} ${branch.avgRating.toFixed(1)}/5.0\n📍 ${address}`;

    Share.share({
      message: `${infoText}\n\n${webLink}`,
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
        onRatingUpdate(newAvg, totalCount);
      } else {
        addFeedback(feedback);
        refetchVelocity();
        const newCount = totalCount + 1;
        const newAvg =
          (averageRating * totalCount + feedback.rating) / newCount;
        onRatingUpdate(newAvg, newCount);
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
    priceRange: getPriceRange(dishes),
    rating: averageRating,
    totalReviewCount: totalCount,
    dietaryPreferenceNames: branch.dietaryPreferenceNames ?? [],
    address: [branch.addressDetail, branch.ward, branch.city]
      .filter(Boolean)
      .join(', '),
    isOpen,
    schedules,
    tier: branchTier?.tier as VendorTier | undefined,
    isTierPaused: branchTier?.isBombingShieldActive,
  };

  const reviews: Review[] = feedbacks.map((f): Review => {
    const dishName = dishes.find((d) => d.dishId === f.dishId)?.name;
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
      editable: !f.updatedAt,
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

  const nearbyRestaurants: NearbyRestaurant[] = nearbyBranches.map((b) => {
    const isMultiBranch = multiBranchVendorIds.includes(b.vendorId);
    const displayName = computeDisplayName(b, isMultiBranch, t('branch'));
    return {
      id: String(b.branchId),
      name: displayName,
      rating: b.avgRating,
      distance: b.distanceKm != null ? `${b.distanceKm.toFixed(1)} km` : '',
      priceRange: getPriceRange(b.dishes),
      imageUri: b.dishes[0]?.imageUrl,
      onPress: () =>
        navigation.navigate('RestaurantDetails', { branch: b, displayName }),
    };
  });

  const cartBranchDisplayName = cartDisplayName ?? cart?.branchName ?? '';

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1">
      <FixedHeaderControls
        onSharePress={handleSharePress}
        isFavorite={isFavorite(branch.branchId)}
        onFavoritePress={() =>
          toggleFavorite(branch, displayName, branchImageUrls[0])
        }
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderImage images={restaurantBanners} progress={progress} />

        <RestaurantInfo restaurant={restaurantInfo} />

        {/* View on map & Giving direction */}
        <View className="flex-row gap-3 px-4 pb-6">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Map', { initialBranch: branch })
            }
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-primary py-2.5"
          >
            <Ionicons name="map-outline" size={18} color={COLORS.primary} />
            <Text className="text-base font-semibold text-primary">
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
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-2.5"
          >
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text className="text-base font-semibold text-white">
              {t('giving_direction', { defaultValue: 'Chỉ đường' })}
            </Text>
          </TouchableOpacity>
        </View>

        <TabBar
          tabs={detailTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="equal"
          activeColor="#FF6B35"
          inactiveColor="#999999"
          indicatorColor="#FF6B35"
        />

        {activeTab === 'menu' && (
          <MenuTab
            branchId={branch.branchId}
            isOpen={isOpen}
            isSubscribed={branch.isSubscribed}
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
            dishes={branch.dishes ?? []}
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
        <View className="absolute bottom-0 left-0 right-0 bg-white px-4 pb-8 pt-3 shadow-lg">
          <View className="flex-row items-center">
            <Text className="mb-2 text-lg font-bold text-gray-700">
              {t('cart.title')} •{' '}
            </Text>

            <Text className="mb-2 text-base font-semibold text-gray-700">
              {cartBranchDisplayName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PersonalCart', {
                branchName: cartBranchDisplayName,
                isOpen,
              })
            }
            className="flex-row items-center justify-between rounded-2xl bg-primary px-5 py-4"
          >
            <Text className="text-base font-bold text-white">
              {t('cart.items_count', { count: cart.items.length })}
            </Text>
            <Text className="text-base font-bold text-white">
              {`${cart.totalAmount.toLocaleString('vi-VN')}đ`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
