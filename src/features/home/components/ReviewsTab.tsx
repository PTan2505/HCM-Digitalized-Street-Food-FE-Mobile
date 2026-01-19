import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';

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

const width = Dimensions.get('window').width;

const ReviewsTab = ({ reviews }: ReviewsTabProps): JSX.Element => {
  const progress = useSharedValue<number>(0);

  const renderReview = (review: Review): JSX.Element => (
    <View
      key={review.id}
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
        <View className="justify-center">
          <View className="flex-row justify-start">
            <Text className="text-[16px] font-semibold text-black">
              Bình luận
            </Text>
          </View>
          <View className="flex-row content-around items-baseline justify-around">
            <Text className="text-[50px] font-bold text-[#06AA4C]">4.5</Text>
            <Text className="text-base text-gray-600">/ 5.0</Text>
          </View>
          <Text className="text-black-400 ml-2 mt-1 text-xs">10 đánh giá</Text>
        </View>

        <View className="flex-1 justify-center">
          <View className="mb-3 flex-row justify-end">
            <Text className="text-[10px] font-semibold text-gray-600 underline">
              Xem thêm
            </Text>
          </View>
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

      {/* Reviews Carousel */}
      <View className="mt-2">
        <Carousel
          style={{
            width: width - 32,
            height: 240,
          }}
          data={reviews}
          onProgressChange={progress}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.95,
            parallaxScrollingOffset: 30,
          }}
          loop={true}
          renderItem={({ item }) => renderReview(item)}
        />
        <Pagination.Basic
          progress={progress}
          data={reviews}
          size={10}
          dotStyle={{
            borderRadius: 100,
            backgroundColor: '#262626',
          }}
          activeDotStyle={{
            borderRadius: 100,
            overflow: 'hidden',
            backgroundColor: '#06AA4C',
          }}
          containerStyle={[
            {
              gap: 5,
              marginBottom: 10,
            },
          ]}
          horizontal
        />
      </View>
    </View>
  );
};

export default ReviewsTab;
