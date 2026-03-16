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
}

const ActionButtons = ({
  branch,
  displayName,
  onBookmark,
}: ActionButtonsProps): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-center gap-2 px-4 pb-4">
      <TouchableOpacity
        onPress={() => {
          onBookmark?.();
          navigation.navigate('RestaurantDetails', {
            branch,
            displayName,
            tab: 'menu',
          });
        }}
        className="h-14 flex-1 items-center justify-center rounded-full bg-[#FF6B2C]"
      >
        <Text className="text-base font-bold text-white">
          {t('actions.view_detail')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;
