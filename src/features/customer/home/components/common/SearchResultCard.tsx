import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { VoucherChip } from '@features/customer/home/components/common/PlaceCard';
import { useTiers } from '@features/customer/home/hooks/useTiers';
import { useWorkSchedule } from '@features/customer/home/hooks/useWorkSchedule';
import type { ActiveBranch, Dish } from '@features/customer/home/types/branch';
import type { VendorTier } from '@features/customer/home/types/stall';
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

const formatPrice = (price: number): string =>
  `${price.toLocaleString('vi-VN')}đ`;

const DishTile = ({ dish }: { dish: Dish }): JSX.Element => (
  <View className="mr-2.5 w-[96px]">
    {/* Image */}
    <View style={{ width: 96, height: 80, position: 'relative' }}>
      <View>
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            style={{
              width: 96,
              height: 80,
              borderRadius: 12,
              overflow: 'hidden',
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 96,
              height: 80,
              borderRadius: 12,
              overflow: 'hidden',
            }}
            className="items-center justify-center bg-lime-50"
          >
            <Ionicons name="fast-food-outline" size={24} color="#4D7C0F" />
          </View>
        )}
      </View>

      {dish.isSoldOut && (
        <View
          style={{ borderRadius: 12 }}
          className="absolute inset-0 items-center justify-center bg-black/40"
        >
          <Text className="text-[10px] font-bold text-white">Hết món</Text>
        </View>
      )}
      {/* Badges — top-left stack */}
      <View className="absolute left-1 top-1 gap-0.5">
        {dish.isBestSeller && (
          <View className="flex-row items-center gap-0.5 rounded-full bg-orange-500 px-1.5 py-0.5">
            <Text className="text-[8px]">🔥</Text>
            <Text className="text-[8px] font-bold text-white">Bán chạy</Text>
          </View>
        )}
        {dish.isSignature && (
          <View className="flex-row items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.5">
            <Text className="text-[8px]">⭐</Text>
            <Text className="text-[8px] font-bold text-white">Đặc trưng</Text>
          </View>
        )}
      </View>
    </View>

    {/* Price */}
    <Text className="mt-1 text-[11px] font-bold text-primary-dark">
      {formatPrice(dish.price)}
    </Text>

    {/* Name */}
    <Text
      className="mt-0.5 text-[11px] leading-[14px] text-gray-700"
      numberOfLines={2}
    >
      {dish.name}
    </Text>
  </View>
);

interface SearchResultCardProps {
  branch: ActiveBranch;
  imageUri?: string;
  displayName: string;
  vouchers?: VoucherChip[];
  onPress?: () => void;
  onSiblingsPress?: () => void;
}

const SearchResultCard = ({
  branch,
  imageUri,
  displayName,
  vouchers,
  onPress,
  onSiblingsPress,
}: SearchResultCardProps): JSX.Element => {
  const { t } = useTranslation();
  const { isLoading, isOpen } = useWorkSchedule(branch.branchId);
  const { tierById } = useTiers();
  const tier = tierById(branch.tierId);
  const touchStartX = useRef(0);

  const distanceLabel =
    branch.distanceKm != null
      ? branch.distanceKm < 1
        ? `${Math.round(branch.distanceKm * 1000)} m`
        : `${branch.distanceKm.toFixed(1)} km`
      : null;

  const visibleDishes = (branch.dishes ?? [])
    .slice()
    .sort((a, b) => {
      const rank = (d: typeof a): number =>
        d.isSignature ? 0 : d.isBestSeller ? 1 : 2;
      return rank(a) - rank(b);
    })
    .slice(0, 10);

  return (
    <View className="mb-3 overflow-hidden rounded-[16px] border border-[#ededed] bg-white">
      {/* ── Top row: image + info ── */}
      <View className="flex-row">
        {/* Left — image */}
        <TouchableOpacity
          onPress={onPress}
          className="relative w-[120px] self-stretch overflow-hidden rounded-tl-[16px] p-2"
        >
          <View style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}>
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
          </View>
          {tier && (
            <View
              className="absolute bottom-1.5 left-1.5 rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: TIER_COLORS[tier] + '33' }}
            >
              <Text className="text-[10px]">{TIER_ICONS[tier]}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Right — info */}
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
            {(branch.dietaryPreferenceNames?.length ?? 0) > 0 && (
              <View className="mt-1.5 flex-row flex-wrap gap-1">
                {(branch.dietaryPreferenceNames ?? [])
                  .slice(0, 3)
                  .map((name) => (
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

          {/* "+N more locations" affordance */}
          {(branch.otherBranches?.length ?? 0) > 0 && onSiblingsPress && (
            <TouchableOpacity
              onPress={onSiblingsPress}
              className="mx-3 mb-2 flex-row items-center gap-1 self-start rounded-full bg-lime-50 px-2.5 py-1"
            >
              <MaterialCommunityIcons
                name="map-marker-multiple-outline"
                size={12}
                color="#4D7C0F"
              />
              <Text className="text-[11px] font-semibold text-primary-dark">
                {t('search.moreLocations', {
                  count: branch.otherBranches!.length,
                })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Voucher strip ── */}
      {(vouchers?.length ?? 0) > 0 && (
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

      {/* ── Dish tiles ── */}
      {visibleDishes.length > 0 && (
        <View className="border-t border-[#f0f0f0] px-3 pb-3 pt-2.5">
          <FlatList
            data={visibleDishes}
            keyExtractor={(d) => String(d.dishId)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <DishTile dish={item} />}
          />
        </View>
      )}
    </View>
  );
};

export default SearchResultCard;
