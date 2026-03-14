import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

export interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  images: ImageSourcePropType[];
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <View
      className="mx-2 rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        minHeight: 220,
      }}
    >
      <View className="mb-3 flex-row items-center">
        <View className="mr-3">
          <Ionicons name="person-circle-outline" size={40} color="#ccc" />
        </View>
        <View className="flex-1">
          <Text className="mb-0.5 text-[15px] font-semibold text-black">
            {review.userName || t('user')}
          </Text>
          <Text className="text-xs text-gray-400">{review.date}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-black">
            {review.rating}
          </Text>
          <Ionicons name="star" size={14} color="#FFA500" />
        </View>
      </View>

      <Text className="mb-1 text-sm leading-5 text-gray-700" numberOfLines={3}>
        {review.comment}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {review.images.map((img, index) => (
          <Image
            key={index}
            source={img}
            className="mr-2 h-20 w-20 rounded-lg"
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default ReviewCard;
