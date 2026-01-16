import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
  images: ImageSourcePropType[];
}

interface ReviewsTabProps {
  reviews: Review[];
}

const ReviewsTab = ({ reviews }: ReviewsTabProps): JSX.Element => {
  const renderReview = (review: Review): JSX.Element => (
    <View key={review.id} className="mb-5 border-b border-gray-200 pb-5">
      <View className="mb-3 flex-row items-center">
        <View className="mr-3">
          <Ionicons name="person-circle-outline" size={40} color="#ccc" />
        </View>
        <View className="flex-1">
          <Text className="mb-0.5 text-[15px] font-semibold text-black">
            {review.userName}
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
      <Text className="mb-3 text-sm leading-5 text-gray-700" numberOfLines={3}>
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

  return (
    <View className="p-4">
      {/* Rating Overview */}
      <View className="mb-6 flex-row gap-5">
        <View className="items-center justify-center">
          <View className="flex-row content-around items-baseline justify-around">
            <Text className="text-[40px] font-bold text-[#06AA4C]">4.5</Text>
            <Text className="text-base text-gray-600">/ 5.0</Text>
          </View>
          <Text className="mt-1 text-xs text-gray-400">10 đánh giá</Text>
        </View>

        <View className="flex-1 justify-center">
          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-[70px] text-[13px] text-gray-600">Đồ ăn</Text>
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-[#00B14F]"
                style={{ width: '94%' }}
              />
            </View>
            <Text className="w-[30px] text-right text-[13px] font-semibold text-black">
              4.7
            </Text>
          </View>

          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-[70px] text-[13px] text-gray-600">Dịch vụ</Text>
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-[#00B14F]"
                style={{ width: '100%' }}
              />
            </View>
            <Text className="w-[30px] text-right text-[13px] font-semibold text-black">
              5.0
            </Text>
          </View>

          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-[70px] text-[13px] text-gray-600">Địa điểm</Text>
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-[#00B14F]"
                style={{ width: '80%' }}
              />
            </View>
            <Text className="w-[30px] text-right text-[13px] font-semibold text-black">
              4.0
            </Text>
          </View>

          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-[70px] text-[13px] text-gray-600">Vibe</Text>
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-[#00B14F]"
                style={{ width: '80%' }}
              />
            </View>
            <Text className="w-[30px] text-right text-[13px] font-semibold text-black">
              4.0
            </Text>
          </View>
        </View>
      </View>

      {/* Reviews List */}
      <View className="mt-2">{reviews.map(renderReview)}</View>
    </View>
  );
};

export default ReviewsTab;
