import type { JSX } from 'react';
import { View, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ImageCarouselWithProgress from '@features/home/components/ImageCarouselWithProgress';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/RestaurantInfo';
import ActionButtons from '@features/home/components/ActionButtons';
import SwipeUpPrompt from '@features/home/components/SwipeUpPrompt';
import SimilarRestaurantCard from '@features/home/components/SimilarRestaurantCard';

interface RestaurantSwipeScreenProps {
  restaurantData?: RestaurantInfoData & { images?: string[] };
  onClose?: () => void;
}

const RestaurantSwipeScreen = ({
  restaurantData,
  onClose,
}: RestaurantSwipeScreenProps = {}): JSX.Element => {
  const { t } = useTranslation();

  const restaurantImages = restaurantData?.images ?? [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=1200',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=1200',
  ];

  const restaurantInfo: RestaurantInfoData = {
    name: restaurantData?.name ?? 'Tiem mi Chan Chan',
    priceRange:
      restaurantData?.priceRange ??
      t('price_format', { from: '200k', to: '500k' }),
    rating: restaurantData?.rating ?? 4.5,
    reviewCount: restaurantData?.reviewCount ?? 0,
    isVegetarian: restaurantData?.isVegetarian ?? true,
    cuisine: restaurantData?.cuisine ?? t('cuisines.chinese'),
    address:
      restaurantData?.address ??
      '25A Ngo Quang Huy, Phuong An Khanh, Ho Chi Minh',
    hours:
      restaurantData?.hours ??
      t('hours_format', {
        start: '8:00',
        end: '23:00',
        days: t('days_range.mon_sat'),
      }),
    isOpen: restaurantData?.isOpen ?? true,
  };

  const similarRestaurants = [
    {
      restaurant: {
        name: 'Quan Chay Huong Sen',
        priceRange: t('price_format', { from: '150k', to: '350k' }),
        rating: 4.3,
        reviewCount: 128,
        isVegetarian: true,
        cuisine: t('cuisines.vegetarian'),
        address: '123 Nguyen Van Linh, Quan 7, Ho Chi Minh',
        hours: t('hours_format', {
          start: '9:00',
          end: '22:00',
          days: t('days_range.mon_sun'),
        }),
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
        priceRange: t('price_format', { from: '180k', to: '450k' }),
        rating: 4.7,
        reviewCount: 256,
        isVegetarian: true,
        cuisine: t('cuisines.chinese'),
        address: '456 Le Van Viet, Quan 9, Ho Chi Minh',
        hours: t('hours_format', {
          start: '7:00',
          end: '21:00',
          days: t('days_range.mon_sat'),
        }),
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
        priceRange: t('price_format', { from: '100k', to: '300k' }),
        rating: 4.6,
        reviewCount: 89,
        isVegetarian: true,
        cuisine: t('cuisines.vietnamese'),
        address: '789 Vo Van Ngan, Thu Duc, Ho Chi Minh',
        hours: t('hours_format', {
          start: '8:00',
          end: '20:00',
          days: t('days_range.mon_sun'),
        }),
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

        {onClose && (
          <View className="absolute left-4 top-12 z-20">
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              onPress={onClose}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

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
