import type { JSX } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, {
  type ICarouselInstance,
} from 'react-native-reanimated-carousel';
import { useRef } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

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

  return (
    <View className="relative">
      <Carousel
        ref={ref}
        width={PAGE_WIDTH}
        height={PAGE_WIDTH * 1.1}
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
      {/* Progress Indicator Bar at Top */}
      <View className="absolute left-0 right-0 top-10 flex-row gap-1 px-3">
        {images.map((_, index) => {
          return (
            <PaginationItem
              key={index}
              index={index}
              length={images.length}
              animValue={progress}
            />
          );
        })}
      </View>
    </View>
  );
};

const PaginationItem: React.FC<{
  index: number;
  length: number;
  animValue: SharedValue<number>;
}> = ({ index, length, animValue }) => {
  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [0.3, 1, 0.3];

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [0.3, 1, 0.3];
    }

    return {
      opacity: interpolate(
        animValue?.value,
        inputRange,
        outputRange,
        Extrapolation.CLAMP
      ),
    };
  }, [animValue, index, length]);

  return (
    <Animated.View
      className="h-1 flex-1 overflow-hidden rounded-full bg-white/40"
      style={[animStyle]}
    >
      <Animated.View className="h-full w-full rounded-full bg-white" />
    </Animated.View>
  );
};

export default ImageCarouselWithProgress;
