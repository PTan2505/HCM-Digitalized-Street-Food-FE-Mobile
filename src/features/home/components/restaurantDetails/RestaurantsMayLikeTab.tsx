import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400';

export interface NearbyRestaurant {
  id: string;
  name: string;
  rating: number;
  distance: string;
  priceRange: string;
  badge?: string;
  imageUri?: string;
}

interface RestaurantsMayLikeTabProps {
  restaurants: NearbyRestaurant[];
}

const RestaurantsMayLikeTab = ({
  restaurants,
}: RestaurantsMayLikeTabProps): JSX.Element => {
  const { t } = useTranslation();

  const renderNearbyRestaurant = (
    restaurant: NearbyRestaurant
  ): JSX.Element => (
    <View
      key={restaurant.id}
      className="mb-4 flex-row rounded-lg border border-gray-200 bg-white p-3"
    >
      <Image
        source={{ uri: restaurant.imageUri ?? PLACEHOLDER_IMAGE }}
        className="mr-3 h-[90px] w-[90px] rounded-lg"
      />
      <View className="flex-1">
        <Text className="mb-1 text-base font-semibold text-black">
          {restaurant.name}
        </Text>
        <View className="mb-1 flex-row items-center gap-1">
          <Ionicons name="star" size={14} color="#FFA500" />
          <Text className="text-sm font-semibold text-[#FFA500]">
            {restaurant.rating}
          </Text>
          <Text className="text-sm text-gray-600">{restaurant.distance}</Text>
        </View>
        <View className="mb-1.5 flex-row items-center gap-1">
          <Ionicons name="pricetag-outline" size={14} color="#00B14F" />
          <Text className="text-[13px] text-[#00B14F]">
            {restaurant.priceRange}
          </Text>
        </View>
        {restaurant.badge && (
          <View className="self-start rounded bg-green-50 px-2 py-1">
            <Text className="text-xs font-semibold text-[#00B14F]">
              {restaurant.badge}
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35]">
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="p-4">
      <Text className="mb-4 text-lg font-bold text-black">
        {t('actions.you_may_like')}
      </Text>
      {restaurants.map(renderNearbyRestaurant)}
    </View>
  );
};

export default RestaurantsMayLikeTab;
