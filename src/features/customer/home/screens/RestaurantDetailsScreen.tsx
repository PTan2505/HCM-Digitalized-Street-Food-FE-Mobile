import TabBar from '@components/TabBar';
import { COLORS } from '@constants/colors';
import type { VendorTier } from '@custom-types/vendor';
import { Ionicons } from '@expo/vector-icons';
import type { RestaurantInfoData } from '@features/customer/home/components/common/RestaurantInfo';
import RestaurantInfo from '@features/customer/home/components/common/RestaurantInfo';
import SearchResultCard from '@features/customer/home/components/common/SearchResultCard';
import FixedHeaderControls from '@features/customer/home/components/restaurantDetails/FixedHeaderControls';
import HeaderImage from '@features/customer/home/components/restaurantDetails/HeaderImage';
import MenuTab from '@features/customer/home/components/restaurantDetails/MenuTab';
import type { Review } from '@features/customer/home/components/restaurantDetails/ReviewsTab';
import ReviewsTab from '@features/customer/home/components/restaurantDetails/ReviewsTab';
import { ReviewFormModal } from '@features/customer/home/components/ReviewFormModal';
import { useBranchDishes } from '@features/customer/home/hooks/useBranchDishes';
import { useBranchFeedback } from '@features/customer/home/hooks/useBranchFeedback';
import { useBranchImages } from '@features/customer/home/hooks/useBranchImages';
import { useCompletedOrdersForBranch } from '@features/customer/home/hooks/useCompletedOrdersForBranch';
import { useFavoriteBranches } from '@features/customer/home/hooks/useFavoriteBranches';
import { useNearbyBranches } from '@features/customer/home/hooks/useNearbyBranches';
import { useOwnBranchFeedback } from '@features/customer/home/hooks/useOwnBranchFeedback';
import { useReviewEligibility } from '@features/customer/home/hooks/useReviewEligibility';
import { useWorkSchedule } from '@features/customer/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { Feedback } from '@features/customer/home/types/feedback';
import { getLowcaAPIUnimplementedEndpoints } from '@features/customer/reputation/api/generated';
import type { BranchTier } from '@features/customer/reputation/types/generated';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
export type TabType = 'menu' | 'reviews' | 'nearby';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
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
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const [orderPickerBackdrop, setOrderPickerBackdrop] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const closeBackdropTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const backdropProgress = useSharedValue(0);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      backdropProgress.value,
      [0, 1],
      ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']
    ),
  }));

  const openOrderPicker = useCallback(() => {
    if (closeBackdropTimeoutRef.current) {
      clearTimeout(closeBackdropTimeoutRef.current);
      closeBackdropTimeoutRef.current = null;
    }
    setOrderPickerBackdrop(true);
    setShowOrderPicker(true);
    backdropProgress.value = withTiming(1, { duration: 220 });
  }, [backdropProgress]);

  const closeOrderPicker = useCallback(() => {
    setShowOrderPicker(false);
    backdropProgress.value = withTiming(0, { duration: 220 });

    if (closeBackdropTimeoutRef.current) {
      clearTimeout(closeBackdropTimeoutRef.current);
    }

    closeBackdropTimeoutRef.current = setTimeout(() => {
      setOrderPickerBackdrop(false);
      closeBackdropTimeoutRef.current = null;
    }, 220);
  }, [backdropProgress]);

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
    hasCompletedOrders,
    completedOrders,
    isLoading: isOrdersLoading,
  } = useCompletedOrdersForBranch(branch.branchId);
  const {
    canReview,
    reason: reviewIneligibilityReason,
    isLoading: isEligibilityLoading,
    userLat,
    userLong,
    refetchVelocity,
  } = useReviewEligibility(
    branch.branchId,
    branch.lat,
    branch.long,
    hasCompletedOrders
  );
  const { branches: nearbyBranches, branchImageMap: nearbyBranchImageMap } =
    useNearbyBranches(branch.lat, branch.long, branch.branchId);

  const { imageUrls: branchImageUrls } = useBranchImages(branch.branchId);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchCartThunk(branch.branchId));
    }, [dispatch, branch.branchId])
  );

  useEffect(() => {
    const { getBranchTier } = getLowcaAPIUnimplementedEndpoints();
    getBranchTier(String(branch.branchId))
      .then(setBranchTier)
      .catch(() => {});
  }, [branch.branchId]);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  useEffect((): (() => void) => {
    return (): void => {
      if (closeBackdropTimeoutRef.current) {
        clearTimeout(closeBackdropTimeoutRef.current);
      }
    };
  }, []);

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
    if (hasCompletedOrders && completedOrders.length > 0) {
      // Pre-select newest order; show picker so user can choose
      setSelectedOrderId(completedOrders[0].orderId);
      openOrderPicker();
    } else {
      setSelectedOrderId(null);
      setShowReviewModal(true);
    }
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

  const restaurantBanners = branchImageUrls.map((url) => ({ uri: url }));

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
      vendorName: branch.vendorName ?? undefined,
      vendorReply: f.vendorReply
        ? {
            content: f.vendorReply.content,
            repliedBy: f.vendorReply.repliedBy,
            createdAt: f.vendorReply.createdAt,
          }
        : undefined,
    };
  });

  const cartBranchDisplayName = cartDisplayName ?? cart?.branchName ?? '';

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
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
                          `https://www.google.com/customer/maps/dir/?api=1&destination=${branch.lat},${branch.long}`
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
                    `https://www.google.com/customer/maps/dir/?api=1&destination=${branch.lat},${branch.long}`
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
            isEligibilityLoading={isEligibilityLoading || isOrdersLoading}
            ownFeedbackId={ownFeedback?.id}
            hasCompletedOrders={hasCompletedOrders}
            branchId={branch.branchId}
            displayName={displayName}
            branchLat={branch.lat}
            branchLong={branch.long}
            onWriteReview={handleOpenWriteReview}
            onEditOwnReview={handleEditReview}
            onDeleteReview={handleDeleteReview}
            onVoteReview={handleVoteReview}
          />
        )}

        {activeTab === 'nearby' && (
          <View className="px-4 pb-4 pt-3">
            {nearbyBranches.map((b) => {
              const isMultiBranch =
                b.vendorId != null && multiBranchVendorIds.includes(b.vendorId);
              const nearbyDisplayName = computeDisplayName(
                b,
                isMultiBranch,
                t('branch')
              );

              return (
                <SearchResultCard
                  key={b.branchId}
                  branch={b}
                  displayName={nearbyDisplayName}
                  imageUri={nearbyBranchImageMap[b.branchId]}
                  onPress={() =>
                    navigation.push('RestaurantDetails', {
                      branch: b,
                      displayName: nearbyDisplayName,
                      tab: 'menu',
                    })
                  }
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {orderPickerBackdrop && (
        <>
          {/* Backdrop — animated independently from the sliding sheet */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                top: -insets.top,
                bottom: -insets.bottom,
              },
              backdropAnimatedStyle,
            ]}
          />
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              {
                top: -insets.top,
                bottom: -insets.bottom,
              },
            ]}
            onPress={closeOrderPicker}
          />
        </>
      )}
      {/* Order picker — shown when user has completed orders and taps Write Review */}
      <Modal
        visible={showOrderPicker}
        transparent
        animationType="slide"
        onRequestClose={closeOrderPicker}
      >
        <View className="flex-1">
          <Pressable className="absolute inset-0" onPress={closeOrderPicker} />
          <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white pb-8 pt-4">
            {/* Handle */}
            <View className="mb-4 items-center">
              <View className="h-1 w-12 rounded-full bg-gray-300" />
            </View>

            <Text className="mb-3 px-4 text-lg font-bold text-black">
              {t('review.pick_order', 'Chọn đơn hàng để đánh giá')}
            </Text>

            {[...completedOrders]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((order) => {
                const isSelected = selectedOrderId === order.orderId;
                return (
                  <TouchableOpacity
                    key={order.orderId}
                    onPress={(): void => setSelectedOrderId(order.orderId)}
                    className={`mx-4 mb-2 rounded-xl border px-4 py-3 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-base font-semibold ${isSelected ? 'text-primary-dark' : 'text-gray-800'}`}
                      >
                        #{order.orderId}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <Text className="mt-1 text-sm text-gray-600">
                      {order.finalAmount.toLocaleString('vi-VN')}₫
                    </Text>
                  </TouchableOpacity>
                );
              })}

            <TouchableOpacity
              onPress={(): void => {
                closeOrderPicker();
                setShowReviewModal(true);
              }}
              disabled={selectedOrderId == null}
              className={`mx-4 mt-3 items-center rounded-xl py-4 ${
                selectedOrderId != null ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`text-base font-semibold ${selectedOrderId != null ? 'text-white' : 'text-gray-400'}`}
              >
                {t('review.write', 'Viết đánh giá')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ReviewFormModal
        visible={showReviewModal}
        branchId={branch.branchId}
        existingFeedback={editingFeedback}
        orderId={editingFeedback == null ? selectedOrderId : null}
        userLat={userLat}
        userLong={userLong}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
      />

      {cart && cart.items.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white px-4 pb-8 pt-3 shadow-lg">
          <View className="flex-row items-center">
            <Text className="mb-2 text-xl font-bold text-gray-700">
              {t('cart.title')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PersonalCart', {
                branchId: branch.branchId,
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
