import { Ionicons } from '@expo/vector-icons';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/common/RestaurantInfo';
import ActionButtons from '@features/home/components/restaurantSwipe/ActionButtons';
import ImageCarouselWithProgress from '@features/home/components/restaurantSwipe/ImageCarouselWithProgress';
import SimilarRestaurantCard from '@features/home/components/restaurantSwipe/SimilarRestaurantCard';
import SwipeUpPrompt from '@features/home/components/restaurantSwipe/SwipeUpPrompt';
import type { ActiveBranch } from '@features/home/types/branch';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { fetchBranchAllImages, selectBranchImageMap } from '@slices/branches';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type RestaurantSwipeScreenProps = StaticScreenProps<{
  branch: ActiveBranch;
  displayName: string;
}>;

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200';

const RestaurantSwipeScreen = ({
  route,
}: RestaurantSwipeScreenProps): JSX.Element => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const { branch, displayName } = route.params;

  useEffect(() => {
    dispatch(fetchBranchAllImages(branch.branchId));
  }, [branch.branchId, dispatch]);

  const restaurantImages =
    (branchImageMap[branch.branchId] ?? []).length > 0
      ? branchImageMap[branch.branchId]
      : [PLACEHOLDER_IMAGE];

  const restaurantInfo: RestaurantInfoData = {
    name: displayName,
    rating: branch.avgRating,
    reviewCount: 0, // TODO: fetch from reviews API
    address: [branch.addressDetail, branch.ward, branch.city]
      .filter(Boolean)
      .join(', '),
    isOpen: branch.isActive,
    // —— fields not yet in API response, placeholder until updated ——
    priceRange: 'Đang cập nhật',
    isVegetarian: false,
    cuisine: 'Đang cập nhật',
    hours: 'Đang cập nhật',
  };

  const similarRestaurants = [
    {
      restaurant: {
        name: 'Quan Chay Huong Sen',
        priceRange: '150k - 350k',
        rating: 4.3,
        reviewCount: 128,
        isVegetarian: true,
        cuisine: 'Món Chay',
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
        reviewCount: 256,
        isVegetarian: true,
        cuisine: 'Món Hoa',
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
        reviewCount: 89,
        isVegetarian: true,
        cuisine: 'Món Việt',
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
            <ActionButtons />
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

export default RestaurantSwipeScreen;
