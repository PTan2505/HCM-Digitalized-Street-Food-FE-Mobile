import type { JSX } from 'react';
import { View, Image, Dimensions } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
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
