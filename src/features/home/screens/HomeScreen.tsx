import SamplePlace from '@assets/SamplePlace.jpg';
import BannerCarousel from '@features/home/components/home/BannerCarousel';
import { PlaceCard } from '@features/home/components/common/PlaceCard';
import { FOOD_CATEGORIES } from '@features/home/constants/categories';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectUser, selectUserStatus } from '@slices/auth';
import '@utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  ScrollView,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CategoryCard from '../components/common/CategoryCard';
import FilterModal, {
  type FilterState,
} from '../components/common/FilterModal';
import HomeHeader from '../components/home/HomeHeader';
import SearchBar from '../components/common/SearchBar';
import Title from '../components/common/Title';

interface PlaceItem {
  id: string;
  title: string;
  rating: number;
  distance: string;
  priceRange: string;
  imageSource: ImageSourcePropType;
  isVegetarian: boolean;
}

const HomeScreen = (): JSX.Element => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const samplePlaces: PlaceItem[] = Array.from({ length: 10 }).map(
    (_, index) => ({
      id: String(index + 1),
      title: `Nhà hàng ${index + 1}`,
      rating: Number((4.0 + (index % 6) * 0.1).toFixed(1)),
      distance: `${(0.5 + index * 0.2).toFixed(1)} km`,
      priceRange: index % 2 === 0 ? 'Từ 30k - 80k' : 'Từ 50k - 200k',
      imageSource: SamplePlace,
      isVegetarian: index % 3 === 0,
    })
  );

  const handleFilterApply = (filters: FilterState): void => {
    console.log('Applied filters:', filters);
    // TODO: Apply filters to the place list
  };

  const banners = [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
  ];

  useEffect(() => {
    console.log('User Status:', userStatus, 'User:', user);
    if (userStatus === 'succeeded' && user) {
      if (!user?.userInfoSetup) {
        navigation.replace('SetupUserInfo');
      } else if (user?.userInfoSetup && !user?.dietarySetup) {
        navigation.replace('DietaryPreferences');
      }
    }
  }, [user, userStatus, navigation]);

  return (
    <>
      <SafeAreaView edges={['left', 'right']} className="flex-1">
        {/* <StatusBar style="light" /> */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#B8E986', '#FFFFFF']}
            locations={[0, 0.4]}
            style={{ paddingTop: insets.top }}
          >
            <HomeHeader />

            <SearchBar
              onPress={() => navigation.navigate('Search')}
              onFilterPress={() => setFilterModalVisible(true)}
            />
            {/* <TestCarousel /> */}
            <BannerCarousel banners={banners} />

            <View className="px-4 py-2">
              <Title>{t('what_want_eat')}</Title>
            </View>

            <View className="flex-row px-4 pt-2">
              <FlatList
                data={FOOD_CATEGORIES}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: 4,
                }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                renderItem={({ item }) => (
                  <CategoryCard
                    title={t(item.titleKey)}
                    image={item.image}
                    onPress={() => console.log(`Selected ${t(item.titleKey)}`)}
                  />
                )}
              />
            </View>

            <View className="px-4 pb-2 pt-6">
              <Title>{t('places_might_like')}</Title>
            </View>

            <View className="flex-row flex-wrap justify-between px-4 pb-6 pt-2">
              {samplePlaces.map((item) => (
                <View key={item.id} className="mb-3 w-[49%]">
                  <PlaceCard
                    title={item.title}
                    rating={item.rating}
                    distance={item.distance}
                    priceRange={item.priceRange}
                    imageSource={item.imageSource}
                    isVegetarian={item.isVegetarian}
                  />
                </View>
              ))}
            </View>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </>
  );
};

export default HomeScreen;
