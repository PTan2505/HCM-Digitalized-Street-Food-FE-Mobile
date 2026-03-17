import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import type { Review } from './ReviewCard';
import ReviewCard from './ReviewCard';

export type { Review } from './ReviewCard';

interface ReviewsTabProps {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
}

const width = Dimensions.get('window').width;

const ReviewsTab = ({
  reviews,
  averageRating,
  totalCount,
}: ReviewsTabProps): JSX.Element => {
  const { t } = useTranslation();
  const progress = useSharedValue<number>(0);

  return (
    <View className="p-4">
      {/* Rating Overview */}
      <View className="mb-6 flex-row gap-5">
        <View className="justify-center">
          <View className="flex-row justify-start">
            <Text className="text-[16px] font-semibold text-black">
              {t('actions.comments')}
            </Text>
          </View>
          <View className="flex-row content-around items-baseline justify-around">
            <Text className="text-[50px] font-bold text-[#06AA4C]">
              {averageRating.toFixed(1)}
            </Text>
            <Text className="text-base text-gray-600">
              {t('actions.rating_out_of')}
            </Text>
          </View>
          <Text className="text-black-400 ml-2 mt-1 text-xs">
            {totalCount} {t('actions.reviews')}
          </Text>
        </View>

        <View className="flex-1 justify-center">
          <View className="mb-3 flex-row justify-end">
            <Text className="text-[10px] font-semibold text-gray-600 underline">
              {t('actions.see_more')}
            </Text>
          </View>
          <View className="mb-2 flex-row items-center gap-2">
            <Text className="w-[70px] text-[13px] text-gray-600">
              {t('actions.food')}
            </Text>
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
            <Text className="w-[70px] text-[13px] text-gray-600">
              {t('actions.service')}
            </Text>
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
            <Text className="w-[70px] text-[13px] text-gray-600">
              {t('actions.location')}
            </Text>
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
            <Text className="w-[70px] text-[13px] text-gray-600">
              {t('actions.vibe')}
            </Text>
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
            height: 260,
          }}
          data={reviews}
          onProgressChange={progress}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.95,
            parallaxScrollingOffset: 30,
          }}
          loop={true}
          renderItem={({ item }) => <ReviewCard review={item} />}
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
