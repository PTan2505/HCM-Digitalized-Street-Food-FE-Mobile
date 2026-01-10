import SamplePlace from '@assets/SamplePlace.jpg';
import BannerCarousel from '@features/home/components/BannerCarousel';
import { PlaceCard } from '@features/home/components/PlaceCard';
import { LinearGradient } from 'expo-linear-gradient';
import type { JSX } from 'react';
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
import CategoryCard from '../components/CategoryCard';
import HomeHeader from '../components/HomeHeader';
import SearchBar from '../components/SearchBar';
import Title from '../components/Title';

interface PlaceItem {
  id: string;
  title: string;
  rating: number;
  distance: string;
  priceRange: string;
  imageSource: ImageSourcePropType;
  isVegetarian: boolean;
}

const SAMPLE_PLACES: PlaceItem[] = Array.from({ length: 10 }).map(
  (_, index) => ({
    id: String(index + 1),
    title: `Quán ăn số ${index + 1}`,
    rating: Number((4.0 + (index % 6) * 0.1).toFixed(1)),
    distance: `${(0.5 + index * 0.2).toFixed(1)} km`,
    priceRange: index % 2 === 0 ? 'Từ 30k đến 80k' : 'Từ 50k đến 200k',
    imageSource: SamplePlace,
    isVegetarian: index % 3 === 0,
  })
);

const HomeScreen = (): JSX.Element => {
  const insets = useSafeAreaInsets();

  const banners = [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
  ];

  const categories = [
    {
      id: '1',
      title: 'Cơm',
      image:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=160&h=160&fit=crop',
    },
    {
      id: '2',
      title: 'Bún',
      image:
        'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=160&h=160&fit=crop',
    },
    {
      id: '3',
      title: 'Phở',
      image:
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=160&h=160&fit=crop',
    },
    {
      id: '4',
      title: 'Cafe',
      image:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=160&h=160&fit=crop',
    },
    {
      id: '5',
      title: 'Trà sữa',
      image:
        'https://images.unsplash.com/photo-1562440499-64e3f2085e04?w=160&h=160&fit=crop',
    },
    {
      id: '6',
      title: 'Lòng se điếu',
      image:
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=160&h=160&fit=crop',
    },
  ];

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

            <SearchBar />
            {/* <TestCarousel /> */}
            <BannerCarousel banners={banners} />

            <View className="px-4 py-2">
              <Title>Bạn muốn ăn gì?</Title>
            </View>

            <View className="flex-row px-4 pt-2">
              <FlatList
                data={categories}
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
                    title={item.title}
                    image={item.image}
                    onPress={() => console.log(`Selected ${item.title}`)}
                  />
                )}
              />
            </View>

            <View className="px-4 pb-2 pt-6">
              <Title>Những địa điểm bạn có thể thích</Title>
            </View>

            <View className="flex-row flex-wrap justify-between px-4 pb-6 pt-2">
              {SAMPLE_PLACES.map((item) => (
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
    </>
  );
};

export default HomeScreen;
