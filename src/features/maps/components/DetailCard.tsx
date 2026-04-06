import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { COLORS } from '@constants/colors';
import type { ActiveBranch } from '@features/home/types/branch';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import React, { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface DetailCardProps {
  branch: ActiveBranch;
  displayName: string;
  imageUri?: string;
  /** true = only peek bar visible (60% hidden); false = full card */
  isPeeked: boolean;
  onClose: () => void;
  /** Called when user taps the peek bar to expand */
  onExpand: () => void;
  /** Called when user taps "Xem chi tiết" */
  onViewDetail: () => void;
}

const FULL_CONTENT_HEIGHT = 260;

export const DetailCard = ({
  branch,
  displayName,
  imageUri,
  isPeeked,
  onClose,
  onExpand,
  onViewDetail,
}: DetailCardProps): JSX.Element => {
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

  const resolvedImageUri =
    imageUri ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(branch.name)}&background=a1d973&color=fff&size=300`;

  const distanceLabel =
    branch.distanceKm != null
      ? branch.distanceKm < 1
        ? `${Math.round(branch.distanceKm * 1000)} m`
        : `${branch.distanceKm.toFixed(1)} km`
      : null;

  const priceRange = getPriceRange(branch.dishes);

  return (
    <Animated.View
      entering={SlideInDown.duration(300)}
      exiting={SlideOutDown.duration(200)}
      className="absolute bottom-0 left-0 right-0 px-4 pb-8"
      pointerEvents="box-none"
    >
      <View className="overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* ── Peek bar — always visible ── */}
        <Pressable
          onPress={isPeeked ? onExpand : onClose}
          className="flex-row items-center justify-between px-4 py-3"
        >
          <View className="flex-1 flex-row items-center">
            <Ionicons name="restaurant" size={16} color={COLORS.primary} />
            <Text
              className="ml-2 flex-1 text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </View>

          <View className="ml-2 flex-row items-center rounded-full bg-amber-50 px-2 py-0.5">
            <MaterialIcons name="star" size={13} color="#FFB800" />
            <Text className="ml-0.5 text-xs font-bold text-gray-800">
              {branch.avgRating.toFixed(1)}
            </Text>
          </View>

          <Ionicons
            name={isPeeked ? 'chevron-up' : 'close'}
            size={18}
            color="#9ca3af"
            style={{ marginLeft: 8 }}
          />
        </Pressable>

        {/* ── Expandable content ── */}
        <Animated.View style={contentAnimatedStyle}>
          {/* Hero image */}
          <View className="relative h-40 w-full bg-gray-200">
            <Image
              source={{ uri: resolvedImageUri }}
              className="h-full w-full"
              resizeMode="cover"
            />

            <View className="absolute bottom-3 left-3 flex-row items-center rounded-full bg-white/90 px-2.5 py-1">
              <MaterialIcons name="star" size={14} color="#FFB800" />
              <Text className="ml-0.5 text-xs font-bold text-gray-800">
                {branch.avgRating.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Info section */}
          <View className="px-4 py-3">
            <View className="flex-row items-center">
              <Ionicons name="location-sharp" size={14} color="#6b7280" />
              <Text
                className="ml-1 flex-1 text-sm text-gray-500"
                numberOfLines={1}
              >
                {branch.addressDetail}, {branch.ward}
              </Text>
            </View>

            {/* Meta row */}
            <View className="mt-1.5 flex-row items-center gap-3">
              {distanceLabel && (
                <View className="flex-row items-center gap-1">
                  <MaterialCommunityIcons
                    name="map-marker-distance"
                    size={13}
                    color="#6b7280"
                  />
                  <Text className="text-xs text-gray-500">{distanceLabel}</Text>
                </View>
              )}
              {priceRange && (
                <View className="flex-row items-center gap-1">
                  <MaterialCommunityIcons
                    name="cash"
                    size={13}
                    color="#6b7280"
                  />
                  <Text className="text-xs text-gray-500">{priceRange}</Text>
                </View>
              )}
              {branch.isSubscribed && (
                <View className="flex-row items-center rounded-full bg-emerald-50 px-2 py-0.5">
                  <MaterialIcons name="verified" size={11} color="#10b981" />
                </View>
              )}
            </View>

            {/* Action button */}
            <Pressable
              onPress={onViewDetail}
              className="mt-3 items-center rounded-xl bg-primary py-3"
            >
              <Text className="text-sm font-bold text-white">Xem chi tiết</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};
