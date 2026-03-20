import { Ionicons } from '@expo/vector-icons';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/common/RestaurantInfo';
import ActionButtons from '@features/home/components/restaurantSwipe/ActionButtons';
import ImageCarouselWithProgress from '@features/home/components/restaurantSwipe/ImageCarouselWithProgress';
import SimilarRestaurantCard from '@features/home/components/restaurantSwipe/SimilarRestaurantCard';
import SwipeUpPrompt from '@features/home/components/restaurantSwipe/SwipeUpPrompt';
import { useBranchImages } from '@features/home/hooks/useBranchImages';
import { useWorkSchedule } from '@features/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/home/types/branch';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type RestaurantSwipeScreenProps = StaticScreenProps<{
  branch: ActiveBranch;
  displayName: string;
  onRatingUpdate?: (avgRating: number, totalReviewCount: number) => void;
}>;

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200';

export const RestaurantSwipeScreen = ({
  route,
}: RestaurantSwipeScreenProps): JSX.Element => {
  const navigation = useNavigation();
  const { branch, displayName, onRatingUpdate } = route.params;
  const [avgRating, setAvgRating] = useState(branch.avgRating);
  const [totalReviewCount, setTotalReviewCount] = useState(
    branch.totalReviewCount
  );

  const handleRatingUpdate = useCallback(
    (newAvgRating: number, newTotalReviewCount: number) => {
      // Update local state for immediate UI feedback
      setAvgRating(newAvgRating);
      setTotalReviewCount(newTotalReviewCount);
      // Update Redux state so HomeScreen sees the change
      onRatingUpdate?.(newAvgRating, newTotalReviewCount);
    },
    [onRatingUpdate]
  );

  const { isOpen, schedules } = useWorkSchedule(branch.branchId);
  const { imageUrls } = useBranchImages(branch.branchId);

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
    isVegetarian: false,
    dietaryPreferenceNames: branch.dietaryPreferenceNames,
    schedules,
  };

  const similarRestaurants = [
    {
      restaurant: {
        name: 'Quan Chay Huong Sen',
        priceRange: '150k - 350k',
        rating: 4.3,
        totalReviewCount: 128,
        isVegetarian: true,
        dietaryPreferenceNames: ['Món Chay'],
        address: '123 Nguyen Van Linh, Quan 7, Ho Chi Minh',
        hours: '9:00 - 22:00 (Thứ 2 - Chủ Nhật)',
        isOpen: true,
      },
      images: [
        'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=1200',
        'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800&h=1200',
        'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800&h=1200',
      ],
    },
    {
      restaurant: {
        name: 'Nha Hang Thien Huong',
        priceRange: '180k - 450k',
        rating: 4.7,
        totalReviewCount: 256,
        isVegetarian: true,
        dietaryPreferenceNames: ['Món Hoa'],
        address: '456 Le Van Viet, Quan 9, Ho Chi Minh',
        hours: '7:00 - 21:00 (Thứ 2 - Thứ 7)',
        isOpen: true,
      },
      images: [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=1200',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=1200',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=1200',
      ],
    },
    {
      restaurant: {
        name: 'Bistro Xanh Healthy',
        priceRange: '100k - 300k',
        rating: 4.6,
        totalReviewCount: 89,
        isVegetarian: true,
        dietaryPreferenceNames: ['Món Việt'],
        address: '789 Vo Van Ngan, Thu Duc, Ho Chi Minh',
        hours: '8:00 - 20:00 (Thứ 2 - Chủ Nhật)',
        isOpen: false,
      },
      images: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=1200',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=1200',
      ],
    },
  ];

  const handleOpenRestaurant = (
    restaurantData: RestaurantInfoData & { images: string[] }
  ): void => {
    console.log('Opening restaurant:', restaurantData);
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-gray-100">
        <StatusBar barStyle="light-content" />

        <View className="absolute left-4 top-12 z-20">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View style={{ height: 450 }}>
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

          <SwipeUpPrompt />

          <View className="px-0 pb-8">
            {similarRestaurants.map((item, index) => (
              <SimilarRestaurantCard
                key={index}
                restaurant={item.restaurant}
                images={item.images}
                onPress={() =>
                  handleOpenRestaurant({
                    ...item.restaurant,
                    images: item.images,
                  })
                }
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};
