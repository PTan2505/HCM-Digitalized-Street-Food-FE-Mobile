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
import { useBranchFeedback } from '@features/home/hooks/useBranchFeedback';
import { useNearbyBranches } from '@features/home/hooks/useNearbyBranches';
import { useWorkSchedule } from '@features/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/home/types/branch';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps } from '@react-navigation/native';
import { fetchBranchAllImages, selectBranchImageMap } from '@slices/branches';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
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

  const { isOpen, schedules } = useWorkSchedule(branch.branchId);
  const { feedbacks, averageRating, totalCount } = useBranchFeedback(
    branch.branchId
  );
  const { branches: nearbyBranches } = useNearbyBranches(
    branch.lat,
    branch.long,
    branch.branchId
  );

  useEffect(() => {
    dispatch(fetchBranchAllImages(branch.branchId));
  }, [branch.branchId, dispatch]);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const rawImageUrls = branchImageMap[branch.branchId] ?? [];
  const restaurantBanners =
    rawImageUrls.length > 0
      ? rawImageUrls.map((url) => ({ uri: url }))
      : [{ uri: PLACEHOLDER_IMAGE }];

  const restaurantInfo: RestaurantInfoData = {
    name: displayName,
    priceRange: getPriceRange(branch.dishes),
    rating: averageRating,
    reviewCount: totalCount,
    isVegetarian: false,
    cuisine: branch.dishes[0]?.categoryName ?? 'Đang cập nhật',
    address: [branch.addressDetail, branch.ward, branch.city]
      .filter(Boolean)
      .join(', '),
    hours: 'Đang cập nhật',
    isOpen,
    schedules,
  };

  const reviews: Review[] = feedbacks.map((f) => ({
    id: String(f.id),
    userName: f.user?.fullName ?? '',
    date: new Date(f.createdAt).toLocaleDateString('vi-VN'),
    rating: f.rating,
    comment: f.comment ?? '',
    imageUris: f.images?.map((img) => img.imageUrl) ?? [],
  }));

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
          />
        )}

        {activeTab === 'nearby' && (
          <RestaurantsMayLikeTab restaurants={nearbyRestaurants} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
