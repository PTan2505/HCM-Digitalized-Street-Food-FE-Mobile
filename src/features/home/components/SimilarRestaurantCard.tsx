import type { JSX } from 'react';
import { View, TouchableOpacity } from 'react-native';
import ImageCarouselWithProgress from '@features/home/components/ImageCarouselWithProgress';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/RestaurantInfo';
import ActionButtons from '@features/home/components/ActionButtons';

interface SimilarRestaurantCardProps {
  restaurant: RestaurantInfoData;
  images: string[];
  onPress: () => void;
}

const SimilarRestaurantCard = ({
  restaurant,
  images,
  onPress,
}: SimilarRestaurantCardProps): JSX.Element => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View className="mb-4">
        <View className="overflow-hidden rounded-t-3xl bg-white">
          <View style={{ height: 450 }}>
            <ImageCarouselWithProgress images={images} />
          </View>

          <View className="overflow-hidden rounded-b-3xl bg-white">
            <RestaurantInfo restaurant={restaurant} />
            <ActionButtons />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SimilarRestaurantCard;
