import { View, Image, Dimensions, FlatList, ViewToken } from 'react-native';
import type { JSX } from 'react';
import { useState, useRef } from 'react';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_MARGIN = 16;

interface BannerCarouselProps {
  banners?: string[];
}

const BannerCarousel = ({
  banners = [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
  ],
}: BannerCarouselProps): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }): void => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  return (
    <View className="mb-6">
      <FlatList
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CARD_MARGIN }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH, marginRight: CARD_MARGIN }}>
            <View className="overflow-hidden rounded-2xl shadow-lg">
              <Image
                source={{ uri: item }}
                style={{ width: CARD_WIDTH, height: 200 }}
                resizeMode="cover"
                className="bg-gray-200"
              />
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Pagination Dots */}
      <View className="mt-3 flex-row justify-center">
        {banners.map((_, index) => (
          <View
            key={index}
            className={`mx-1 h-2 rounded-full ${
              index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerCarousel;
