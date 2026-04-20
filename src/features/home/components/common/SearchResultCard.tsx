import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { VoucherChip } from '@features/home/components/common/PlaceCard';
import { useWorkSchedule } from '@features/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/home/types/branch';
import type { VendorTier } from '@features/home/types/stall';
import type { JSX } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

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

const formatVoucherDiscount = (discountValue: number, type: string): string => {
  if (type.toUpperCase() === 'PERCENT') return `-${discountValue}%`;
  return `-${discountValue.toLocaleString('vi-VN')}đ`;
};

interface SearchResultCardProps {
  branch: ActiveBranch;
  /** Optional override — pass branchImageMap[id]?.[0] for cached home images */
  imageUri?: string;
  displayName: string;
  vouchers?: VoucherChip[];
  onPress?: () => void;
}

const SearchResultCard = ({
  branch,
  imageUri,
  displayName,
  vouchers,
  onPress,
}: SearchResultCardProps): JSX.Element => {
  const { t } = useTranslation();
  const { isLoading, isOpen } = useWorkSchedule(branch.branchId);
  const touchStartX = useRef(0);

  const distanceLabel =
    branch.distanceKm != null
      ? branch.distanceKm < 1
        ? `${Math.round(branch.distanceKm * 1000)} m`
        : `${branch.distanceKm.toFixed(1)} km`
      : null;

  return (
    <View className="mb-3 flex-row overflow-hidden rounded-[16px] border border-[#ededed] bg-white">
      {/* Left — image, stretches full card height */}
      <TouchableOpacity
        onPress={onPress}
        className="relative w-[120px] self-stretch overflow-hidden rounded-l-[16px]"
      >
        {imageUri ? (
          <Image
            style={{ flex: 1 }}
            source={{ uri: imageUri }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full flex-1 items-center justify-center bg-lime-100">
            <Ionicons name="restaurant" size={34} color="#4D7C0F" />
          </View>
        )}
        {branch.tier && (
          <View
            className="absolute bottom-1.5 left-1.5 rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: TIER_COLORS[branch.tier] + '33' }}
          >
            <Text className="text-[10px]">{TIER_ICONS[branch.tier]}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Right — info + vouchers */}
      <View className="flex-1">
        <TouchableOpacity
          onPress={onPress}
          className="justify-between px-3 py-2.5"
        >
          {/* Name */}
          <Text
            className="text-[13px] font-bold leading-[18px] text-black"
            numberOfLines={2}
          >
            {displayName}{' '}
            {branch.isSubscribed && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={13}
                color="#186bde"
              />
            )}
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
                  className="rounded-full bg-orange-50 px-2 py-0.5"
                >
                  <Text className="text-[10px] font-medium text-orange-500">
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
                  className={`text-[10px] font-semibold ${isOpen ? 'text-primary-dark' : 'text-[#6B7280]'}`}
                >
                  {isOpen ? t('actions.open') : t('actions.closed')}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {vouchers && vouchers.length > 0 && (
          <View
            onTouchStart={(e) => {
              touchStartX.current = e.nativeEvent.pageX;
            }}
            onTouchEnd={(e) => {
              const dx = Math.abs(e.nativeEvent.pageX - touchStartX.current);
              if (dx < 8) onPress?.();
            }}
          >
            <FlatList
              data={vouchers}
              keyExtractor={(v) => String(v.voucherId)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 8,
                paddingBottom: 6,
                paddingTop: 0,
                gap: 4,
              }}
              renderItem={({ item }) => (
                <View className="flex-row items-center overflow-hidden rounded-md border border-secondary/20 bg-[#FFF8F5]">
                  <View className="items-center justify-center self-stretch bg-secondary px-1.5">
                    <MaterialCommunityIcons
                      name="ticket-percent"
                      size={10}
                      color="#fff"
                    />
                  </View>
                  <View className="h-11 justify-center gap-2 px-2 py-1.5">
                    <Text className="text-[9px] font-bold text-secondary">
                      {t('voucher.discount')}{' '}
                      {formatVoucherDiscount(item.discountValue, item.type)}
                    </Text>
                    {!!item.minAmountRequired && (
                      <Text className="text-[9px] text-secondary">
                        {t('voucher.min_order')}
                        {`${item.minAmountRequired.toLocaleString('vi-VN')}đ`}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchResultCard;
