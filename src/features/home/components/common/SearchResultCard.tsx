import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWorkSchedule } from '@features/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/home/types/branch';
import type { VendorTier } from '@features/home/types/stall';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const TIER_COLORS: Record<VendorTier, string> = {
  diamond: '#60A5FA',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  warning: '#EF4444',
};

const TIER_ICONS: Record<VendorTier, string> = {
  diamond: '💎',
  gold: '🥇',
  silver: '🥈',
  warning: '⚠️',
};

interface SearchResultCardProps {
  branch: ActiveBranch;
  /** Optional override — pass branchImageMap[id]?.[0] for cached home images */
  imageUri?: string;
  onPress?: () => void;
}

const SearchResultCard = ({
  branch,
  imageUri,
  onPress,
}: SearchResultCardProps): JSX.Element => {
  const { t } = useTranslation();
  const { isLoading, isOpen } = useWorkSchedule(
    branch.isActive ? branch.branchId : null
  );

  const resolvedImageUri =
    imageUri ??
    branch.dishes[0]?.imageUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(branch.name)}&background=a1d973&color=fff&size=300`;

  const distanceLabel =
    branch.distanceKm != null
      ? branch.distanceKm < 1
        ? `${Math.round(branch.distanceKm * 1000)} m`
        : `${branch.distanceKm.toFixed(1)} km`
      : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 flex-row overflow-hidden rounded-[16px] border border-[#ededed] bg-white"
    >
      {/* Left — image */}
      <View className="relative h-[120px] w-[120px] overflow-hidden rounded-l-[16px]">
        <Image
          source={{ uri: resolvedImageUri }}
          className="h-full w-full"
          resizeMode="cover"
        />
        {branch.tier && (
          <View
            className="absolute bottom-1.5 left-1.5 rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: TIER_COLORS[branch.tier] + '33' }}
          >
            <Text className="text-[10px]">{TIER_ICONS[branch.tier]}</Text>
          </View>
        )}
      </View>

      {/* Right — info */}
      <View className="flex-1 justify-between px-3 py-2.5">
        {/* Name */}
        <Text
          className="text-[13px] font-bold leading-[18px] text-black"
          numberOfLines={2}
        >
          {branch.isVerified && (
            <MaterialCommunityIcons
              name="check-decagram"
              size={13}
              color="#186bde"
            />
          )}{' '}
          {branch.name}
        </Text>

        {/* Rating + review count + distance */}
        <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
          <MaterialCommunityIcons
            name="star"
            size={12}
            color="rgba(250,204,21,1)"
          />
          <Text className="text-[12px] font-semibold text-[rgba(250,204,21,1)]">
            {branch.avgRating.toFixed(1)}
          </Text>
          <Text className="text-[11px] text-[#979797]">
            ({branch.totalReviewCount})
          </Text>
          {distanceLabel && (
            <>
              <Text className="text-[#D1D5DB]">·</Text>
              <View className="flex-row items-center gap-1">
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={11}
                  color="#979797"
                />
                <Text className="text-[11px] text-[#979797]">
                  {distanceLabel}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Address */}
        <View className="mt-1 flex-row items-center gap-1">
          <MaterialCommunityIcons
            name="map-marker"
            size={12}
            color="#a5cf7bff"
          />
          <Text
            className="flex-1 text-[11px] leading-[14px] text-[#979797]"
            numberOfLines={1}
          >
            {branch.addressDetail}
          </Text>
        </View>

        {/* Dietary chips */}
        {branch.dietaryPreferenceNames.length > 0 && (
          <View className="mt-1.5 flex-row flex-wrap gap-1">
            {branch.dietaryPreferenceNames.slice(0, 3).map((name) => (
              <View
                key={name}
                className="rounded-full bg-[#F0FAE8] px-2 py-0.5"
              >
                <Text className="text-[10px] font-medium text-[#06AA4C]">
                  {name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Open / closed badge */}
        {!isLoading && (
          <View className="mt-1">
            <View
              className={`self-start rounded-full px-2 py-0.5 ${isOpen ? 'bg-[#E8F5E9]' : 'bg-[#F3F4F6]'}`}
            >
              <Text
                className={`text-[10px] font-semibold ${isOpen ? 'text-[#06AA4C]' : 'text-[#6B7280]'}`}
              >
                {isOpen ? t('actions.open') : t('actions.closed')}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SearchResultCard;
