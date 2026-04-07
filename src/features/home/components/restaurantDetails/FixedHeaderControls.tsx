import type { JSX } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface FixedHeaderControlsProps {
  onBackPress?: () => void;
  onSharePress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

const FixedHeaderControls: (props: FixedHeaderControlsProps) => JSX.Element = ({
  onBackPress,
  onSharePress,
  onFavoritePress,
  isFavorite = false,
}) => {
  const navigation = useNavigation();

  return (
    <>
      <View className="absolute left-3 top-[60px] z-10">
        <TouchableOpacity
          onPress={onBackPress ?? ((): void => navigation.goBack())}
          className="h-9 w-9 items-center justify-center rounded-full bg-black/50"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View className="absolute right-3 top-[60px] z-10 flex-row gap-2">
        <TouchableOpacity
          onPress={onSharePress}
          className="h-9 w-9 items-center justify-center rounded-full bg-black/50"
        >
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onFavoritePress}
          className="h-9 w-9 items-center justify-center rounded-full bg-black/50"
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#FF4D4D' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default FixedHeaderControls;
