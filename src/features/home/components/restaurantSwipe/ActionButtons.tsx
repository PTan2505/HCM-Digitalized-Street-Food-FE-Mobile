import menuIcon from '@assets/icons/menu.svg';
import reviewIcon from '@assets/icons/review.svg';
import SvgIcon from '@components/SvgIcon';
import type { ActiveBranch } from '@features/home/types/branch';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  branch: ActiveBranch;
  displayName: string;
  onBookmark?: () => void;
  onShare?: () => void;
  onAddToCurrentPick?: () => void;
  onRatingUpdate?: (avgRating: number, totalReviewCount: number) => void;
}

const ActionButtons = ({
  branch,
  displayName,
  onBookmark,
  onRatingUpdate,
}: ActionButtonsProps): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-center gap-2 px-4 pb-4">
      <TouchableOpacity
        className="h-[28px] w-[49px] items-center justify-center rounded-[36px] bg-[rgba(237,237,237,1)] p-[5px] pb-[7px]"
        onPress={() => {
          onBookmark?.();
          navigation.navigate('RestaurantDetails', {
            branch,
            displayName,
            tab: 'menu',
            onRatingUpdate,
          });
        }}
      >
        <SvgIcon
          icon={menuIcon}
          width={'17px'}
          height={'12px'}
          color="#FF6B2C"
        />
      </TouchableOpacity>
      <TouchableOpacity
        className="h-[28px] w-[49px] items-center justify-center rounded-[36px] bg-[rgba(237,237,237,1)] p-[5px] pb-[7px]"
        onPress={() => {
          onBookmark?.();
          navigation.navigate('RestaurantDetails', {
            branch,
            displayName,
            tab: 'reviews',
            onRatingUpdate,
          });
        }}
      >
        <SvgIcon
          icon={reviewIcon}
          width={'14px'}
          height={'14px'}
          color="#FF6B2C"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onBookmark?.();
          navigation.navigate('RestaurantDetails', {
            branch,
            displayName,
            tab: 'menu',
            onRatingUpdate,
          });
        }}
        className="h-[42px] flex-1 items-center justify-center rounded-full bg-[#FF6B2C]"
      >
        <Text className="text-base font-bold text-white">
          {t('actions.view_detail')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;
