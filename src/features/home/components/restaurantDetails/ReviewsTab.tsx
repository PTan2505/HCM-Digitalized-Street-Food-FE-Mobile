import type { ReviewIneligibilityReason } from '@features/home/hooks/useReviewEligibility';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import type { Review } from './ReviewCard';
import ReviewCard from './ReviewCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
/** Outer padding applied by the parent tab container */
const CONTAINER_PADDING = 0;
const CONTAINER_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING;
/** Each card is 78% of the container → ~1.28 cards visible at once */
const CARD_WIDTH = Math.round(CONTAINER_WIDTH * 0.78);
const DEFAULT_CARD_HEIGHT = 300;

export type { Review } from './ReviewCard';

interface ReviewsTabProps {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
  canReview: boolean;
  reviewIneligibilityReason: ReviewIneligibilityReason | null;
  isEligibilityLoading: boolean;
  /** Set when the current user already has a review for this branch */
  ownFeedbackId?: number;
  onWriteReview: () => void;
  onEditOwnReview: () => void;
  onDeleteReview: (feedbackId: number) => void;
  onVoteReview: (feedbackId: number, voteType: 'up' | 'down') => void;
}

const INELIGIBILITY_MESSAGES: Record<ReviewIneligibilityReason, string> = {
  permission_denied: 'Cần quyền truy cập vị trí để đánh giá',
  too_far: 'Bạn cần ở gần quán hơn để đánh giá',
  daily_limit_reached: 'Bạn đã đánh giá đủ số lần cho phép hôm nay',
  already_reviewed_today: 'Bạn đã đánh giá quán này hôm nay',
  loading: '',
};

const ReviewsTab = ({
  reviews,
  averageRating,
  totalCount,
  canReview,
  reviewIneligibilityReason,
  isEligibilityLoading,
  ownFeedbackId,
  onWriteReview,
  onEditOwnReview,
  onDeleteReview,
  onVoteReview,
}: ReviewsTabProps): JSX.Element => {
  const { t } = useTranslation();
  const progress = useSharedValue<number>(0);

  // Reorder reviews: own review first, then up to 4 others (max 5 total)
  const displayReviews = useMemo(() => {
    const ownReview = reviews.find((r) => r.isOwn);
    const otherReviews = reviews.filter((r) => !r.isOwn);

    // If user has own review: [ownReview, ...first 4 others]
    // Otherwise: first 5 reviews
    const ordered = ownReview
      ? [ownReview, ...otherReviews.slice(0, 4)]
      : otherReviews.slice(0, 5);

    return ordered;
  }, [reviews]);

  // Dynamic card width: full width if only 1 review, 78% if more than 1
  const cardWidth = displayReviews.length === 1 ? CONTAINER_WIDTH : CARD_WIDTH;

  // Measure tallest card for dynamic carousel height
  const [carouselHeight, setCarouselHeight] = useState(DEFAULT_CARD_HEIGHT);
  const handleCardLayout = useCallback((height: number) => {
    setCarouselHeight((prev) => Math.max(prev, height) + 20);
  }, []);

  return (
    <View>
      <View className="px-4 pt-4">
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

        {/* Write / Edit Review */}
        <View className="mb-4">
          {!ownFeedbackId && (
            <>
              <TouchableOpacity
                onPress={onWriteReview}
                disabled={!canReview || isEligibilityLoading}
                className={`items-center rounded-xl py-3 ${canReview && !isEligibilityLoading ? 'bg-primary' : 'bg-gray-200'}`}
              >
                {isEligibilityLoading ? (
                  <ActivityIndicator size="small" color="#7AB82D" />
                ) : (
                  <Text
                    className={`text-sm font-semibold ${canReview ? 'text-white' : 'text-gray-400'}`}
                  >
                    Viết đánh giá
                  </Text>
                )}
              </TouchableOpacity>
              {!canReview &&
                !isEligibilityLoading &&
                reviewIneligibilityReason &&
                reviewIneligibilityReason !== 'loading' && (
                  <Text className="mt-1.5 text-center text-xs text-gray-500">
                    {INELIGIBILITY_MESSAGES[reviewIneligibilityReason]}
                  </Text>
                )}
            </>
          )}
        </View>
      </View>

      {/* Reviews Carousel */}
      <View className="mt-2" style={{ overflow: 'visible' }}>
        <Carousel
          itemWidth={cardWidth}
          style={{
            width: CONTAINER_WIDTH,
            height: carouselHeight,
            overflow: 'visible',
          }}
          data={displayReviews}
          onProgressChange={progress}
          loop={false}
          renderItem={({ item }) => (
            <View
              onLayout={(e): void =>
                handleCardLayout(e.nativeEvent.layout.height)
              }
            >
              <ReviewCard
                review={item}
                onEdit={onEditOwnReview}
                onDelete={onDeleteReview}
                onVote={onVoteReview}
              />
            </View>
          )}
        />
        <Pagination.Basic
          progress={progress}
          data={displayReviews}
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
