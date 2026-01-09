import { View, Text, ScrollView, FlatList, type ImageSourcePropType, Animated } from 'react-native';
import type { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import HomeHeader from '../components/HomeHeader';
import SearchBar from '../components/SearchBar';
import BannerCarousel from '../components/BannerCarousel';
import CategoryCard from '../components/CategoryCard';
import { StatusBar } from 'expo-status-bar';
import { PlaceCard } from "@features/home/components/PlaceCard";

interface PlaceItem {
    id: string;
    title: string;
    rating: number;
    distance: string;
    priceRange: string;
    imageSource: ImageSourcePropType;
    isVegetarian: boolean;
};

const SAMPLE_PLACES: PlaceItem[] = Array.from({ length: 10 }).map((_, index) => ({
    id: String(index + 1),
    title: `Quán ăn số ${index + 1}`,
    rating: Number((4.0 + (index % 6) * 0.1).toFixed(1)),
    distance: `${(0.5 + index * 0.2).toFixed(1)} km`,
    priceRange: index % 2 === 0 ? 'Từ 30k đến 80k' : 'Từ 50k đến 200k',
    imageSource: require('@assets/SamplePlace.jpg'),
    isVegetarian: index % 3 === 0,
}));

const HomeScreen = (): JSX.Element => {
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
  ];

  return (
    <LinearGradient
      colors={['#B8E986', '#FFFFFF']}
      locations={[0, 0.4]}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />

      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <HomeHeader />

          <SearchBar />

          <BannerCarousel banners={banners} />

          <View className="mb-6 px-4">
            <Text className="title-md mb-4 text-gray-900">
              What are you craving?
            </Text>

            <View className="flex-row justify-between">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  image={category.image}
                  onPress={() => console.log(`Selected ${category.title}`)}
                />
              ))}
            </View>
          </View>

          <View className="px-4 pb-6">
            <Text className="title-md mb-4 text-gray-900">
              Places you might like
            </Text>
            <View className="h-40 items-center justify-center rounded-2xl bg-gray-100">
              <FlatList
                    data={SAMPLE_PLACES}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
                    contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                    renderItem={({ item }) => (
                        <PlaceCard
                            title={item.title}
                            rating={item.rating}
                            distance={item.distance}
                            priceRange={item.priceRange}
                            imageSource={item.imageSource}
                            isVegetarian={item.isVegetarian}
                        />
                    )}
                />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;
