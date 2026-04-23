import RestaurantInfo, {
  type RestaurantInfoData,
} from '@features/customer/home/components/common/RestaurantInfo';
import { useBranchDishes } from '@features/customer/home/hooks/useBranchDishes';
import { useBranchImages } from '@features/customer/home/hooks/useBranchImages';
import { useWorkSchedule } from '@features/customer/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { TouchableOpacity, View } from 'react-native';
import ActionButtons from './ActionButtons';
import ImageCarouselWithProgress from './ImageCarouselWithProgress';

interface SimilarRestaurantCardProps {
  restaurant: Omit<RestaurantInfoData, 'priceRange' | 'isOpen' | 'schedules'>;
  branchId: number;
  branch?: ActiveBranch;
  onPress: () => void;
}

const SimilarRestaurantCard = ({
  restaurant,
  branchId,
  branch,
  onPress,
}: SimilarRestaurantCardProps): JSX.Element => {
  const { imageUrls } = useBranchImages(branchId);
  const { isOpen, schedules } = useWorkSchedule(branchId);
  const { dishes } = useBranchDishes(branchId);
  const images = imageUrls;

  const restaurantInfo: RestaurantInfoData = {
    ...restaurant,
    priceRange: getPriceRange(dishes),
    isOpen,
    schedules,
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View className="mb-4">
        <View className="overflow-hidden rounded-t-3xl bg-white">
          <View style={{ height: 450 }}>
            <ImageCarouselWithProgress images={images} />
          </View>

          <View className="overflow-hidden rounded-b-3xl bg-white">
            <RestaurantInfo restaurant={restaurantInfo} />
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
