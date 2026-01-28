import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StaticScreenProps } from '@react-navigation/native';
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
import HeaderImage from '@features/home/components/HeaderImage';
import FixedHeaderControls from '@features/home/components/FixedHeaderControls';
import { useSharedValue } from 'react-native-reanimated';

type RestaurantDetailsScreenProps = StaticScreenProps<{ tab: TabType }>;

const RestaurantDetailsScreen = ({
  route,
}: RestaurantDetailsScreenProps): JSX.Element => {
  const { tab } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>(tab);
  const progress = useSharedValue<number>(0);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

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
    {
      id: '3',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Quán có không gian rộng rãi, thoáng mát, nhân viên phục vụ nhiệt tình. Món ăn thì rất ngon, đặc biệt là món mì tiềm chay...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
    {
      id: '4',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Mình rất thích không gian quán, rất yên tĩnh và thoải mái. Món ăn thì ngon, đặc biệt là món mì viên kho Hồng Kông...',
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
      <FixedHeaderControls />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderImage images={restaurantBanners} progress={progress} />

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

export default RestaurantDetailsScreen;
