import type { JSX } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <View className="flex-row items-center justify-center gap-2 px-4 pb-4">
      <TouchableOpacity
        onPress={onBookmark}
        className="h-10 w-14 items-center justify-center rounded-full border border-gray-200 bg-white"
      >
        <Ionicons name="restaurant-outline" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onShare}
        className="h-10 w-14 items-center justify-center rounded-full border border-gray-200 bg-white"
      >
        <Ionicons name="chatbubble-outline" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onAddToCurrentPick}
        className="h-14 flex-1 items-center justify-center rounded-full bg-[#FF6B2C]"
      >
        <Text className="text-base font-bold text-white">
          Thêm vào Current Pick
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;
