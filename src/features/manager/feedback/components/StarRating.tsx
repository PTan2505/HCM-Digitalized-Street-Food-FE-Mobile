import React from 'react';
import { Text, View } from 'react-native';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
} as const;

export const StarRating = ({
  rating,
  maxStars = 5,
  size = 'md',
}: StarRatingProps): React.JSX.Element => {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View className="flex-row items-center">
      {stars.map((star) => (
        <Text
          key={star}
          className={`${SIZE_MAP[size]} ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
        >
          ★
        </Text>
      ))}
    </View>
  );
};
