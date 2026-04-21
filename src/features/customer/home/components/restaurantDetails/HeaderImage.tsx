import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Dimensions, Image, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';

const width = Dimensions.get('window').width;

interface HeaderImageProps {
  images: ImageSourcePropType[];
  progress: SharedValue<number>;
}

const HeaderImage: (props: HeaderImageProps) => JSX.Element = ({
  images,
  progress,
}) => {
  if (images.length === 0) {
    return (
      <View
        className="items-center justify-center bg-lime-100"
        style={{ width, height: 300 }}
      >
        <Ionicons name="restaurant" size={64} color="#4D7C0F" />
      </View>
    );
  }

  return (
    <View className="relative h-[300px]">
      <Carousel
        style={{ width, height: 300 }}
        data={images}
        onProgressChange={progress}
        renderItem={({ index }) => (
          <View className="flex flex-1 justify-center">
            <Image
              source={images[index]}
              style={{ width: width, height: 300 }}
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

export default HeaderImage;
