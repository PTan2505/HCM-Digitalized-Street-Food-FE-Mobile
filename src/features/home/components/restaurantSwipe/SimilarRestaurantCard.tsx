import type { JSX } from 'react';
import { View, TouchableOpacity } from 'react-native';
import ImageCarouselWithProgress from './ImageCarouselWithProgress';
import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/home/components/common/RestaurantInfo';
import ActionButtons from './ActionButtons';
import type { ActiveBranch } from '@features/home/types/branch';

interface SimilarRestaurantCardProps {
  restaurant: RestaurantInfoData;
  branch?: ActiveBranch;
  images: string[];
  onPress: () => void;
}

const SimilarRestaurantCard = ({
  restaurant,
  branch,
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
            {branch && (
              <ActionButtons branch={branch} displayName={restaurant.name} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SimilarRestaurantCard;
