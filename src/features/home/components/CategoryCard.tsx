import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { JSX } from 'react';

interface CategoryCardProps {
  title: string;
  image: string;
  onPress?: () => void;
}

const CategoryCard = ({
  title,
  image,
  onPress,
}: CategoryCardProps): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center"
      style={{ width: 80 }}
    >
      <View className="mb-2 h-20 w-20 overflow-hidden rounded-full bg-white shadow-md">
        <Image
          source={{ uri: image }}
          style={{ width: 80, height: 80 }}
          resizeMode="cover"
        />
      </View>
      <Text className="text-center text-sm font-medium text-gray-900">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;
