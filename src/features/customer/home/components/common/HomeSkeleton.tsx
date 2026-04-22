import { Dimensions } from 'react-native';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Matches BannerCarousel: const BANNER_HEIGHT = Math.round(width / 2)
const BANNER_HEIGHT = Math.round(SCREEN_WIDTH / 2);

// ---------------------------------------------------------------------------
// Base pulsing skeleton box
// ---------------------------------------------------------------------------
const SkeletonBox = ({ style }: { style?: object }): JSX.Element => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.4, { duration: 600 })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ backgroundColor: '#E5E7EB' }, animatedStyle, style]}
    />
  );
};

// ---------------------------------------------------------------------------
// BannerCarousel skeleton
// Matches: <View style={{ height: BANNER_HEIGHT, overflow: 'hidden' }}>
// ---------------------------------------------------------------------------
export const BannerCarouselSkeleton = (): JSX.Element => (
  <View style={{ height: BANNER_HEIGHT, overflow: 'hidden' }}>
    <SkeletonBox style={{ flex: 1 }} />
  </View>
);

// ---------------------------------------------------------------------------
// CategoryCard skeleton — matches CategoryCard exactly:
//   width: 80 container
//   h-20 w-20 rounded-full + mb-2  → 80px circle + 8px margin
//   text-base (fontSize:16, lineHeight:24) → 24px text
// Total height per item: 80 + 8 + 24 = 112px
//
// CategoryRowSkeleton mirrors the FlatList contentContainerStyle:
//   paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4
//   ItemSeparatorComponent: width 12
// ---------------------------------------------------------------------------
export const CategoryRowSkeleton = (): JSX.Element => (
  <View
    style={{
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
      gap: 12,
    }}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <View key={i} style={{ alignItems: 'center', width: 80 }}>
        {/* h-20 w-20 rounded-full mb-2 */}
        <SkeletonBox
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
        />
        {/* text-base: lineHeight 24 */}
        <SkeletonBox style={{ width: 56, height: 24, borderRadius: 4 }} />
      </View>
    ))}
  </View>
);

// ---------------------------------------------------------------------------
// PlaceCard skeleton — mirrors PlaceCard structure exactly:
//
// <View> overflow-hidden rounded-[16.81px] border border-[#ededed]
//   <View> p-[6.31px]                               → padding: 6.31
//     <View> h-[117.7px] rounded-t-[14.71px]        → image: 117.7px
//     <View> px-[8.41px] py-[4.2px]                 → content wrapper
//       <Text> py-1 min-h-[36px] leading-[18px]     → 4 + 36 + 4 = 44px
//       <View> py-1 (icon 13, leading-[14px])        → 4 + 14 + 4 = 22px
//       <View> pt-1 (icon 13, leading-[16px] ×2)    → 4 + 32       = 36px
//
// Total height: 6.31 + 117.7 + (4.2 + 44 + 22 + 36 + 4.2) + 6.31 = 240.72px
// ---------------------------------------------------------------------------
export const PlaceCardSkeleton = (): JSX.Element => (
  <View
    style={{
      overflow: 'hidden',
      borderRadius: 16.81,
      borderWidth: 1,
      borderColor: '#ededed',
      backgroundColor: 'white',
    }}
  >
    <View style={{ padding: 6.31 }}>
      {/* Image area: h-[117.7px] rounded-t-[14.71px] */}
      <SkeletonBox style={{ height: 117.7, borderRadius: 14.71 }} />

      {/* Content area: px-[8.41px] py-[4.2px] */}
      <View style={{ paddingHorizontal: 8.41, paddingVertical: 4.2 }}>
        {/* Name: py-1 (4+4) + min-h-[36px] with leading-[18px] × 2 lines = 36px */}
        <View style={{ paddingVertical: 4 }}>
          <SkeletonBox
            style={{ height: 12.6, borderRadius: 6, marginBottom: 10.8 }}
          />
          <SkeletonBox
            style={{ height: 12.6, borderRadius: 6, width: '65%' }}
          />
        </View>

        {/* Rating row: py-1 (4+4) + max(icon 13, leading-[14px]) = 14px */}
        <View style={{ paddingVertical: 4 }}>
          <SkeletonBox style={{ height: 14, borderRadius: 7, width: '55%' }} />
        </View>

        {/* Address row: pt-1 (4) + leading-[16px] × 2 lines = 32px */}
        <View style={{ paddingTop: 4 }}>
          <SkeletonBox
            style={{ height: 12, borderRadius: 6, marginBottom: 8 }}
          />
          <SkeletonBox style={{ height: 12, borderRadius: 6, width: '70%' }} />
        </View>
      </View>
    </View>
  </View>
);

// ---------------------------------------------------------------------------
// Two-column PlaceCard row skeleton
// Mirrors columnWrapperStyle: justifyContent:'space-between', marginBottom:12
// No horizontal padding here — parent (<View className="px-4"> or
// columnWrapperStyle paddingHorizontal:16) handles it.
// ---------------------------------------------------------------------------
export const PlaceCardRowSkeleton = (): JSX.Element => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    }}
  >
    <View style={{ width: '49%' }}>
      <PlaceCardSkeleton />
    </View>
    <View style={{ width: '49%' }}>
      <PlaceCardSkeleton />
    </View>
  </View>
);
