import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useRef } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, {
  Pagination,
  type ICarouselInstance,
} from 'react-native-reanimated-carousel';

const width = Dimensions.get('window').width;
const PAGE_WIDTH = width;

interface ImageCarouselWithProgressProps {
  images: string[];
}

const ImageCarouselWithProgress = ({
  images,
}: ImageCarouselWithProgressProps): JSX.Element => {
  const progress = useSharedValue<number>(0);
  const ref = useRef<ICarouselInstance>(null);

  if (images.length === 0) {
    return (
      <View
        className="items-center justify-center bg-lime-100"
        style={{ width: PAGE_WIDTH, height: PAGE_WIDTH * 1.1 }}
      >
        <Ionicons name="restaurant" size={64} color="#4D7C0F" />
      </View>
    );
  }

  return (
    <View className="relative">
      <Carousel
        ref={ref}
        style={{ width: PAGE_WIDTH, height: PAGE_WIDTH * 1.1 }}
        data={images}
        onProgressChange={progress}
        pagingEnabled={true}
        snapEnabled={true}
        renderItem={({ item }) => (
          <View className="flex-1">
            <Image
              source={{ uri: item }}
              style={{ width: PAGE_WIDTH, height: PAGE_WIDTH * 1.1 }}
              resizeMode="cover"
            />
          </View>
        )}
      />
      <View className="absolute bottom-3 w-full items-center">
        <Pagination.Basic
          progress={progress}
          data={images}
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
    </View>
  );
};

export default ImageCarouselWithProgress;
