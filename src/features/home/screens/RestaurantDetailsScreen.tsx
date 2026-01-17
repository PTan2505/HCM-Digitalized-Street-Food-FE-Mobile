import { useState } from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SamplePlace from '@assets/SamplePlace.jpg';
import ReviewsTab, { type Review } from '@features/home/components/ReviewsTab';
import RestaurantsMayLikeTab, {
  type NearbyRestaurant,
} from '@features/home/components/RestaurantsMayLikeTab';
import MenuTab, { type MenuItem } from '@features/home/components/MenuTab';
import TabsBar, { type TabType } from '@features/home/components/TabsBar';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/RestaurantInfo';

const width = Dimensions.get('window').width;

const RestaurantScreen: () => JSX.Element = () => {
  const [activeTab, setActiveTab] = useState<TabType>('menu');
  const progress = useSharedValue<number>(0);

  const restaurantBanners = [SamplePlace, SamplePlace, SamplePlace];

  const restaurantInfo: RestaurantInfoData = {
    name: 'Tiệm mì Chan Chan',
    priceRange: 'Từ 50k đến 200k',
    rating: 4.5,
    reviewCount: 10,
    isVegetarian: true,
    cuisine: 'Món Hoa',
    address: '25A Ngô Quang Huy, Phường An Khánh, Hồ Chí Minh',
    hours: '8:00 - 23:00 (Thứ hai - Thứ bảy)',
    isOpen: true,
  };

  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Mì viên kho Hồng Kông',
      description: 'Mì trứng, viên chay, hành tím, gừng, rau cải và đủ độ',
      price: '200k',
      image: SamplePlace,
      category: 'new',
    },
    {
      id: '2',
      name: 'Mì tiềm chay',
      description:
        'Mì trứng, nấm đông cô, cà rốt, táo đỏ, kỷ tử, gừng, rau cải',
      price: '150k',
      image: SamplePlace,
      category: 'main',
    },
  ];

  const appetizers: MenuItem[] = [
    {
      id: '3',
      name: 'Nấm Bào Ngư Tempura',
      description: 'Nấm tươi chiên giòn mềm ngọt chấm cùng sốt cay béo',
      price: '80k',
      image: SamplePlace,
      category: 'appetizer',
    },
  ];

  const desserts: MenuItem[] = [
    {
      id: '4',
      name: 'Chè Đậu Đỏ Mochi',
      description:
        'Đậu đỏ hấm mềm, đường thốt nốt, nước cốt dừa, muối, bột nếp, me rang và ít dừa',
      price: '50k',
      image: SamplePlace,
      category: 'dessert',
    },
  ];

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Lần đầu ghé quán ăn thấy rất tuyệng ngay tử lúc bước vào. Không gian quán mình mát, decor thì xịn như Tết ở Trung Quốc...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
    {
      id: '2',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Đồ ăn quán ngon, vừa miệng, trelệt bài bảng số của tiệm ấm cúng và có hình ảnh đặt...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
  ];

  const nearbyRestaurants: NearbyRestaurant[] = [
    {
      id: '1',
      name: 'Bánh mì Huỳnh Hoa',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 150k đến 200k',
      badge: 'Đơn sẵn',
      image: SamplePlace,
    },
    {
      id: '2',
      name: 'Quán Gà Ta Muối',
      rating: 4.3,
      distance: '0.8 km',
      priceRange: 'Từ 150k đến 200k',
      badge: 'Đơn sẵn',
      image: SamplePlace,
    },
    {
      id: '3',
      name: 'The Gangs Mạc Đĩnh Chi',
      rating: 4.4,
      distance: '1.2 km',
      priceRange: 'Từ 200k đến 500k',
      badge: 'Tư tập bạn bè',
      image: SamplePlace,
    },
  ];

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View className="relative h-[300px]">
          <Carousel
            data={restaurantBanners}
            onProgressChange={progress}
            renderItem={({ index }) => (
              <View className="flex flex-1 justify-center">
                <Image
                  source={restaurantBanners[index]}
                  style={{ width: width, height: 300 }}
                  resizeMode="cover"
                />
              </View>
            )}
          />
          <View className="absolute bottom-3 w-full items-center">
            <Pagination.Basic
              progress={progress}
              data={restaurantBanners}
              size={10}
              dotStyle={{
                borderRadius: 100,
                backgroundColor: '#262626',
              }}
              activeDotStyle={{
                borderRadius: 100,
                overflow: 'hidden',
                backgroundColor: '#f1f1f1',
              }}
              containerStyle={[
                {
                  gap: 5,
                  marginBottom: 10,
                },
              ]}
              horizontal
            />
          </View>
          <TouchableOpacity className="absolute left-3 top-12 h-9 w-9 items-center justify-center rounded-full bg-black/50">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="absolute right-3 top-12 flex-row gap-2">
            <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-black/50">
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-black/50">
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <RestaurantInfo restaurant={restaurantInfo} />

        <TabsBar activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'menu' && (
          <MenuTab
            menuItems={menuItems}
            appetizers={appetizers}
            desserts={desserts}
          />
        )}

        {activeTab === 'reviews' && <ReviewsTab reviews={reviews} />}

        {activeTab === 'nearby' && (
          <RestaurantsMayLikeTab restaurants={nearbyRestaurants} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RestaurantScreen;
