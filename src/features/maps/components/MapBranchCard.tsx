import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import type { ActiveBranch } from '@features/home/types/branch';
import { getPriceRange } from '@utils/priceUtils';
import type { JSX } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface MapBranchCardProps {
  branch: ActiveBranch;
  displayName: string;
  imageUri?: string;
  /** Called when tapping the card — selects branch on map */
  onPress?: () => void;
  /** Called when tapping the navigate chevron — opens RestaurantSwipe */
  onNavigate?: () => void;
}

export const MapBranchCard = ({
  branch,
  displayName,
  imageUri,
  onPress,
  onNavigate,
}: MapBranchCardProps): JSX.Element => {
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
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row border-b border-gray-100 bg-white px-4 py-3"
    >
      {/* Thumbnail */}
      <View className="h-[80px] w-[80px] overflow-hidden rounded-xl">
        <Image
          source={{ uri: resolvedImageUri }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View className="ml-3 flex-1 justify-center">
        <View className="flex-row items-start justify-between">
          <Text
            className="flex-1 text-[14px] font-bold text-gray-900"
            numberOfLines={1}
          >
            {displayName}
            {branch.isVerified && (
              <>
                {' '}
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={13}
                  color="#186bde"
                />
              </>
            )}
          </Text>
          <TouchableOpacity className="ml-1">
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={20}
              color="#EE6612"
            />
          </TouchableOpacity>
        </View>

        {/* Rating + Distance */}
        <View className="mt-1 flex-row items-center gap-1.5">
          <MaterialIcons name="star" size={14} color="#FACC15" />
          <Text className="text-xs font-semibold text-[#FACC15]">
            {branch.avgRating.toFixed(1)}
          </Text>
          {distanceLabel && (
            <>
              <Text className="text-xs text-gray-300">·</Text>
              <Text className="text-xs text-gray-500">{distanceLabel}</Text>
            </>
          )}
        </View>

        {/* Price range */}
        {priceRange && (
          <View className="mt-1 flex-row items-center gap-1">
            <MaterialCommunityIcons name="cash" size={13} color="#6B7280" />
            <Text className="text-xs text-gray-500">{priceRange}</Text>
          </View>
        )}

        {/* Dietary tags */}
        {branch.dietaryPreferenceNames.length > 0 && (
          <View className="mt-1.5 flex-row flex-wrap gap-1">
            {branch.dietaryPreferenceNames.slice(0, 2).map((name) => (
              <View
                key={name}
                className="rounded-full bg-[#E8F5E9] px-2 py-0.5"
              >
                <Text className="text-[10px] font-medium text-[#06AA4C]">
                  {name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Navigate chevron */}
      {onNavigate && (
        <TouchableOpacity
          onPress={onNavigate}
          className="ml-1 items-center justify-center px-1"
        >
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
