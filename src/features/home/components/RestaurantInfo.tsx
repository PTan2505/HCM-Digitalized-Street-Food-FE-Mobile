import type { JSX } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export interface RestaurantInfoData {
  name: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  isVegetarian?: boolean;
  cuisine: string;
  address: string;
  hours: string;
  isOpen: boolean;
}

interface RestaurantInfoProps {
  restaurant: RestaurantInfoData;
}

const RestaurantInfo = ({ restaurant }: RestaurantInfoProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <View className="p-4">
      <View className="mb-2 flex-row justify-between">
        <Text className="text-2xl font-bold text-black">{restaurant.name}</Text>
        <Ionicons name="share-social-outline" size={25} color="#00000" />
      </View>

      <View className="mb-2 flex-row items-center gap-2">
        <Text className="text-sm font-semibold text-[#06AA4C]">
          {restaurant.priceRange}
        </Text>
        <View className="flex-row items-center gap-0.5">
          <Ionicons name="star" size={16} color="#FACC15" />
          <Text className="text-sm font-semibold text-[#FACC15]">
            {restaurant.rating}
          </Text>
        </View>
        {restaurant.reviewCount > 0 && (
          <Text className="text-sm text-gray-600">
            {restaurant.reviewCount} {t('actions.reviews')}
          </Text>
        )}
      </View>

      <View className="mb-3 flex-row items-center gap-2">
        {restaurant.isVegetarian && (
          <View className="rounded-2xl bg-[#00B14F] px-2 py-1">
            <Text className="text-xs font-semibold text-white">
              {t('actions.vegetarian_food')}
            </Text>
          </View>
        )}
        <View className="rounded-2xl bg-[#F1FAEA] px-2 py-1">
          <Text className="text-xs text-gray-600">{restaurant.cuisine}</Text>
        </View>
      </View>

      <Text className="mb-4 text-sm leading-5 text-gray-600">
        {restaurant.address}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-gray-600">{restaurant.hours}</Text>
        <Text
          className={`text-sm font-semibold ${
            restaurant.isOpen ? 'text-[#00B14F]' : 'text-red-500'
          }`}
        >
          {restaurant.isOpen ? t('actions.open') : t('actions.closed')}
        </Text>
      </View>
    </View>
  );
};

export default RestaurantInfo;
