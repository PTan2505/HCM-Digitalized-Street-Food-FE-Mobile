import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  onBookmark?: () => void;
  onShare?: () => void;
  onAddToCurrentPick?: () => void;
}

const ActionButtons = ({
  onBookmark,
  onShare,
  onAddToCurrentPick,
}: ActionButtonsProps): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-center gap-2 px-4 pb-4">
      {/* <TouchableOpacity
        onPress={onAddToCurrentPick}
        className="h-10 w-14 items-center justify-center rounded-full border border-gray-200 bg-white"
      >
        <Ionicons name="restaurant-outline" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          onShare?.();
          navigation.navigate('RestaurantDetails', { tab: 'reviews' });
        }}
        className="h-10 w-14 items-center justify-center rounded-full border border-gray-200 bg-white"
      >
        <Ionicons name="chatbubble-outline" size={24} color="#333" />
      </TouchableOpacity> */}

      <TouchableOpacity
        onPress={() => {
          onBookmark?.();
          navigation.navigate('RestaurantDetails', { tab: 'menu' });
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
