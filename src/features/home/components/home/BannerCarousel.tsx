import type { SystemCampaign } from '@features/campaigns/types/generated';
import type { JSX } from 'react';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

const width = Dimensions.get('window').width;
const BANNER_HEIGHT = Math.round(width / 2);

interface BannerCarouselProps {
  items: SystemCampaign[];
  onCampaignPress?: (
    campaignId: string,
    campaignType: 'system' | 'restaurant'
  ) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const BannerCarousel = ({
  items,
  onCampaignPress,
  onLoadMore,
  hasMore,
}: BannerCarouselProps): JSX.Element => {
  const progress = useSharedValue<number>(0);

  if (items.length === 0) return <View />;

  return (
    <View style={{ height: BANNER_HEIGHT, overflow: 'hidden' }}>
      <Carousel
        style={{ width, height: BANNER_HEIGHT }}
        data={items}
        onProgressChange={progress}
        loop={true}
        autoPlay={true}
        autoPlayInterval={2000}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        onScrollEnd={(index) => {
          if (hasMore && index >= items.length - 2) {
            onLoadMore?.();
          }
        }}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() =>
                onCampaignPress?.(String(item.campaignId), 'system')
              }
              activeOpacity={0.85}
              className="flex flex-1 justify-center"
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: width, height: 200 }}
                resizeMode="cover"
                className="rounded-[14px]"
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default BannerCarousel;
