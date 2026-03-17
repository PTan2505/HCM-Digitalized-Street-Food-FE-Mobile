import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { MapVendor } from '@features/home/types/stall';
import React, { JSX, useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DetailCardProps {
  vendor: MapVendor;
  /** true = only peek bar visible; false = full card */
  isPeeked: boolean;
  onClose: () => void;
  /** Called when user taps the peek bar to expand */
  onExpand: () => void;
}

/**
 * Height of the expandable content (image 176 + info ~164 = ~340).
 * When peeked, this amount slides down so only the peek bar stays visible.
 */
const FULL_CONTENT_HEIGHT = 300;

// ---------------------------------------------------------------------------
// DetailCard — animated bottom sheet (TripAdvisor-style)
// ---------------------------------------------------------------------------
export const DetailCard = ({
  vendor,
  isPeeked,
  onClose,
  onExpand,
}: DetailCardProps): JSX.Element => {
  // Animate the height of the expandable content: full → 0 when peeked
  const contentHeight = useSharedValue(FULL_CONTENT_HEIGHT);
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    contentHeight.value = withTiming(isPeeked ? 0 : FULL_CONTENT_HEIGHT, {
      duration: 250,
    });
    contentOpacity.value = withTiming(isPeeked ? 0 : 1, {
      duration: 200,
    });
  }, [isPeeked, contentHeight, contentOpacity]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    height: contentHeight.value,
    opacity: contentOpacity.value,
    overflow: 'hidden' as const,
  }));

  return (
    <Animated.View
      entering={SlideInDown.duration(300)}
      exiting={SlideOutDown.duration(200)}
      className="absolute bottom-0 left-0 right-0 px-4 pb-8"
      pointerEvents="box-none"
    >
      <View className="overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* ── Peek bar — always visible, tappable to expand ── */}
        <Pressable
          onPress={isPeeked ? onExpand : onClose}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <View className="flex-1 flex-row items-center">
            <Ionicons name="restaurant" size={16} color="#a1d973" />
            <Text
              className="ml-2 flex-1 text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {vendor.name}
            </Text>
          </View>

          {/* Rating badge */}
          <View className="ml-2 flex-row items-center rounded-full bg-amber-50 px-2 py-0.5">
            <MaterialIcons name="star" size={13} color="#FFB800" />
            <Text className="ml-0.5 text-xs font-bold text-gray-800">
              {vendor.avgRating}
            </Text>
          </View>

          {/* Chevron indicator */}
          <Ionicons
            name={isPeeked ? 'chevron-up' : 'close'}
            size={18}
            color="#9ca3af"
            style={{ marginLeft: 8 }}
          />
        </Pressable>

        {/* ── Expandable content (collapses to 0 height when peeked) ── */}
        <Animated.View style={contentAnimatedStyle}>
          {/* Hero image */}
          <View className="relative h-44 w-full bg-gray-200">
            <Image
              source={{ uri: vendor.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />

            {/* Rating pill (bottom-left on image) */}
            <View className="absolute bottom-3 left-3 flex-row items-center rounded-full bg-white/90 px-2.5 py-1">
              <MaterialIcons name="star" size={14} color="#FFB800" />
              <Text className="ml-0.5 text-xs font-bold text-gray-800">
                {vendor.avgRating}
              </Text>
            </View>
          </View>

          {/* Info section */}
          <View className="px-4 py-3">
            {/* Meta row */}
            <View className="flex-row items-center">
              <Ionicons name="location-sharp" size={14} color="#6b7280" />
              <Text className="ml-1 text-sm text-gray-500" numberOfLines={1}>
                {vendor.addressDetail}, {vendor.ward}
              </Text>
            </View>

            {/* Tags */}
            <View className="mt-2.5 flex-row gap-2">
              {vendor.isVerified && (
                <View className="flex-row items-center rounded-full bg-emerald-50 px-2.5 py-1">
                  <MaterialIcons name="verified" size={12} color="#10b981" />
                  <Text className="ml-1 text-xs font-medium text-emerald-600">
                    Đã xác minh
                  </Text>
                </View>
              )}
              <View className="rounded-full bg-amber-50 px-2.5 py-1">
                <Text className="text-xs font-medium text-amber-600">
                  {vendor.tierId === 'tier_premium'
                    ? 'Premium'
                    : vendor.tierId === 'tier_standard'
                      ? 'Standard'
                      : 'Basic'}
                </Text>
              </View>
              {vendor.isActive && (
                <View className="rounded-full bg-green-50 px-2.5 py-1">
                  <Text className="text-xs font-medium text-green-600">
                    Đang mở
                  </Text>
                </View>
              )}
            </View>

            {/* Action button */}
            <Pressable className="mt-3 items-center rounded-xl bg-[#a1d973] py-3">
              <Text className="text-sm font-bold text-white">Xem chi tiết</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};
