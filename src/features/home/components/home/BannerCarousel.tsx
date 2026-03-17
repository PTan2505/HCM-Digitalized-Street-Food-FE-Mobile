import type { JSX } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

const width = Dimensions.get('window').width;

interface BannerCarouselProps {
  banners: string[];
}

const BannerCarousel = ({ banners }: BannerCarouselProps): JSX.Element => {
  const progress = useSharedValue<number>(0);

  return (
    <View style={{ height: width / 2, overflow: 'hidden' }}>
      <Carousel
        style={{ width, height: width / 2 }}
        data={banners}
        onProgressChange={progress}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({ index }) => (
          <View className="flex flex-1 justify-center">
            <Image
              source={{ uri: banners[index] }}
              style={{ width: width, height: 200 }}
              resizeMode="cover"
              className="rounded-[14px]"
            />
          </View>
        )}
      />
    </View>
  );
};

export default BannerCarousel;
