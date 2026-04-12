import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/common/RestaurantInfo';
import ActionButtons from '@features/home/components/restaurantSwipe/ActionButtons';
import ImageCarouselWithProgress from '@features/home/components/restaurantSwipe/ImageCarouselWithProgress';
import SimilarRestaurantCard from '@features/home/components/restaurantSwipe/SimilarRestaurantCard';
import SwipeUpPrompt from '@features/home/components/restaurantSwipe/SwipeUpPrompt';
import { useBranchImages } from '@features/home/hooks/useBranchImages';
import { useSimilarBranches } from '@features/home/hooks/useSimilarBranches';
import { useWorkSchedule } from '@features/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/home/types/branch';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { computeDisplayName } from '@slices/branches';
import { invokeCallback, removeCallback } from '@utils/callbackRegistry';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type RestaurantSwipeScreenProps = StaticScreenProps<{
  branch: ActiveBranch;
  displayName: string;
  onRatingUpdateId?: string;
}>;

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200';

const LOAD_MORE_THRESHOLD = 300;

export const RestaurantSwipeScreen = ({
  route,
}: RestaurantSwipeScreenProps): JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { t } = useTranslation();
  const { branch, displayName, onRatingUpdateId } = route.params;
  const [avgRating, setAvgRating] = useState(branch.avgRating);
  const [totalReviewCount, setTotalReviewCount] = useState(
    branch.totalReviewCount
  );

  useEffect(() => {
    return (): void => {
      if (onRatingUpdateId) removeCallback(onRatingUpdateId);
    };
  }, [onRatingUpdateId]);

  const handleRatingUpdate = useCallback(
    (newAvgRating: number, newTotalReviewCount: number) => {
      // Update local state for immediate UI feedback
      setAvgRating(newAvgRating);
      setTotalReviewCount(newTotalReviewCount);
      // Propagate back to the caller screen
      if (onRatingUpdateId)
        invokeCallback(onRatingUpdateId, newAvgRating, newTotalReviewCount);
    },
    [onRatingUpdateId]
  );

  const { isOpen, schedules } = useWorkSchedule(branch.branchId);
  const { imageUrls } = useBranchImages(branch.branchId);
  const {
    branches: similarBranches,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSimilarBranches(branch.branchId);

  const restaurantImages =
    imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE];

  const restaurantInfo: RestaurantInfoData = {
    name: displayName,
    rating: avgRating,
    totalReviewCount,
    address: [branch.addressDetail, branch.ward, branch.city]
      .filter(Boolean)
      .join(', '),
    isOpen,
    // —— fields not yet in API response, placeholder until updated ——
    priceRange: getPriceRange(branch.dishes),
    dietaryPreferenceNames: branch.dietaryPreferenceNames ?? [],
    schedules,
  };

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      if (
        distanceFromBottom < LOAD_MORE_THRESHOLD &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-gray-100">
        <StatusBar barStyle="light-content" />

        <View className="absolute left-3 top-[60px] z-20">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          <View>
            <ImageCarouselWithProgress images={restaurantImages} />
          </View>

          <View className="overflow-hidden rounded-b-3xl bg-white">
            <RestaurantInfo restaurant={restaurantInfo} />
            <ActionButtons
              branch={branch}
              displayName={displayName}
              onRatingUpdate={handleRatingUpdate}
            />
          </View>
          {similarBranches.length > 0 && <SwipeUpPrompt />}
          <View className="px-0 pb-8">
            {similarBranches.map((similarBranch) => {
              const similarActiveBranch: ActiveBranch = {
                branchId: similarBranch.branchId,
                vendorId: similarBranch.vendorId,
                vendorName: similarBranch.vendorName,
                managerId: 0,
                name: similarBranch.name,
                phoneNumber: '',
                email: '',
                addressDetail: similarBranch.addressDetail,
                ward: similarBranch.ward ?? '',
                city: similarBranch.city,
                lat: similarBranch.lat,
                long: similarBranch.long,
                createdAt: '',
                updatedAt: null,
                isVerified: true,
                avgRating: similarBranch.avgRating,
                totalReviewCount: similarBranch.totalReviewCount,
                totalRatingSum:
                  similarBranch.avgRating * similarBranch.totalReviewCount,
                dietaryPreferenceNames: [],
                isActive: true,
                isSubscribed: similarBranch.isSubscribed,
                tierId: 0,
                tierName: '',
                finalScore: similarBranch.similarityScore,
                distanceKm: null,
                dishes: [],
              };
              const isMultiBranch =
                similarBranch.name !== similarBranch.vendorName;
              const similarDisplayName = computeDisplayName(
                similarActiveBranch,
                isMultiBranch,
                t('branch')
              );
              return (
                <SimilarRestaurantCard
                  key={similarBranch.branchId}
                  branchId={similarBranch.branchId}
                  branch={similarActiveBranch}
                  restaurant={{
                    name: similarDisplayName,
                    rating: similarBranch.avgRating,
                    totalReviewCount: similarBranch.totalReviewCount,
                    address: [
                      similarBranch.addressDetail,
                      similarBranch.ward,
                      similarBranch.city,
                    ]
                      .filter(Boolean)
                      .join(', '),
                    dietaryPreferenceNames: [],
                  }}
                  onPress={() => {}}
                />
              );
            })}
            {isFetchingNextPage && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};
