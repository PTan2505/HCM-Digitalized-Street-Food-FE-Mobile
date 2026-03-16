import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StaticScreenProps } from '@react-navigation/native';
import SamplePlace from '@assets/SamplePlace.jpg';
import ReviewsTab, {
  type Review,
} from '@features/home/components/restaurantDetails/ReviewsTab';
import RestaurantsMayLikeTab, {
  type NearbyRestaurant,
} from '@features/home/components/restaurantDetails/RestaurantsMayLikeTab';
import MenuTab, {
  type MenuItem,
} from '@features/home/components/restaurantDetails/MenuTab';
import TabsBar, {
  type TabType,
} from '@features/home/components/restaurantDetails/TabsBar';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/common/RestaurantInfo';
import HeaderImage from '@features/home/components/restaurantDetails/HeaderImage';
import FixedHeaderControls from '@features/home/components/restaurantDetails/FixedHeaderControls';
import { useSharedValue } from 'react-native-reanimated';
import i18n from '@utils/i18n';

type RestaurantDetailsScreenProps = StaticScreenProps<{ tab: TabType }>;

export const RestaurantDetailsScreen = ({
  route,
}: RestaurantDetailsScreenProps): JSX.Element => {
  const { tab } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>(tab);
  const progress = useSharedValue<number>(0);

  useEffect(() => {
    setActiveTab(tab);
    const currentLanguage = i18n.language;
    console.log('Current language:', currentLanguage);
  }, [tab]);

  const restaurantBanners = [SamplePlace, SamplePlace, SamplePlace];

  const restaurantInfo: RestaurantInfoData = {
    name: 'Tiem mi Chan Chan',
    priceRange: 'Từ 50k - 200k',
    rating: 4.5,
    reviewCount: 10,
    isVegetarian: true,
    cuisine: 'Món Hoa',
    address: '25A Ngo Quang Huy, Phuong An Khanh, Ho Chi Minh',
    hours: '8:00 - 23:00 (Thứ 2 - Thứ 7)',
    isOpen: true,
  };

  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Mi vien kho Hong Kong',
      description: 'Mi trung, vien chay, hanh tim, gung, rau cai va du do',
      price: '200k',
      image: SamplePlace,
      category: 'new',
    },
    {
      id: '2',
      name: 'Mi tiem chay',
      description:
        'Mi trung, nam dong co, ca rot, tao do, ky tu, gung, rau cai',
      price: '150k',
      image: SamplePlace,
      category: 'main',
    },
  ];

  const appetizers: MenuItem[] = [
    {
      id: '3',
      name: 'Nam Bao Ngu Tempura',
      description: 'Nam tuoi chien gion mem ngot cham cung sot cay beo',
      price: '80k',
      image: SamplePlace,
      category: 'appetizer',
    },
  ];

  const desserts: MenuItem[] = [
    {
      id: '4',
      name: 'Che Dau Do Mochi',
      description:
        'Dau do ham mem, duong thot not, nuoc cot dua, muoi, bot nep, me rang va it dua',
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
        'Lan dau ghe quan an thay rat tuyeng ngay tu luc buoc vao. Khong gian quan minh mat, decor thi xin nhu Tet o Trung Quoc...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
    {
      id: '2',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Do an quan ngon, vua mieng, trelet bai bang so cua tiem am cung va co hinh anh dat...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
    {
      id: '3',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Quan co khong gian rong rai, thoang mat, nhan vien phuc vu nhiet tinh. Mon an thi rat ngon, dac biet la mon mi tiem chay...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
    {
      id: '4',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Minh rat thich khong gian quan, rat yen tinh va thoai mai. Mon an thi ngon, dac biet la mon mi vien kho Hong Kong...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
    {
      id: '5',
      userName: 'Người dùng',
      date: '02/09/2025',
      rating: 4.5,
      comment:
        'Food is amazing, staff are friendly and attentive. The ambiance is perfect for a relaxing meal with friends or family...',
      images: [SamplePlace, SamplePlace, SamplePlace, SamplePlace],
    },
  ];

  const nearbyRestaurants: NearbyRestaurant[] = [
    {
      id: '1',
      name: 'Banh mi Huynh Hoa',
      rating: 4.5,
      distance: '0.8 km',
      priceRange: 'Từ 150k - 200k',
      badge: 'Sẵn sàng đặt',
      image: SamplePlace,
    },
    {
      id: '2',
      name: 'Quan Ga Ta Muoi',
      rating: 4.3,
      distance: '0.8 km',
      priceRange: 'Từ 150k - 200k',
      badge: 'Sẵn sàng đặt',
      image: SamplePlace,
    },
    {
      id: '3',
      name: 'The Gangs Mac Dinh Chi',
      rating: 4.4,
      distance: '1.2 km',
      priceRange: 'Từ 200k - 500k',
      badge: 'Tu tap ban be',
      image: SamplePlace,
    },
    {
      id: '4',
      name: 'The Gangs Mac Dinh Chi',
      rating: 4.4,
      distance: '1.2 km',
      priceRange: 'Từ 200k - 500k',
      badge: 'Tu tap ban be',
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

