import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CategoryCardProps {
  title: string;
  image?: string;
  onPress?: () => void;
  selected?: boolean;
}

const CategoryCard = ({
  title,
  image,
  onPress,
  selected = false,
}: CategoryCardProps): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center"
      style={{ width: 80 }}
    >
      <View
        className={`mb-2 h-20 w-20 items-center justify-center rounded-full bg-white ${
          selected ? 'border-[2px] border-primary-dark p-[3px]' : ''
        }`}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            className="h-full w-full rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center rounded-full bg-lime-100">
            <Ionicons name="fast-food-outline" size={28} color="#4D7C0F" />
          </View>
        )}
      </View>
      <Text className="text-center text-[14px] font-semibold capitalize text-gray-900">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;
