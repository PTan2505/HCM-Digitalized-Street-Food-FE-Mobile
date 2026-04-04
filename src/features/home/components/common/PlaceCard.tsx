import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { VoucherDto } from '@features/campaigns/api/voucherApi';
import type { ActiveBranch } from '@features/home/types/branch';
import type { VendorTier } from '@features/home/types/stall';
import type { UserCoords } from '@features/maps/hooks/useLocationPermission';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
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

interface PlaceCardProps {
  branch: ActiveBranch;
  displayName: string;
  imageUri?: string;
  userCoords?: UserCoords | null;
  onPress?: () => void;
  tier?: VendorTier;
  isFlashBoosted?: boolean;
  /** undefined = don't show badge (e.g. not yet fetched) */
  isOpen?: boolean;
  vouchers?: VoucherDto[];
}

const formatVoucherDiscount = (discountValue: number, type: string): string => {
  if (type.toUpperCase() === 'PERCENT') return `-${discountValue}%`;
  return `-${discountValue.toLocaleString('vi-VN')}đ`;
};

export const PlaceCard = ({
  branch,
  displayName,
  imageUri,
  onPress,
  tier,
  isFlashBoosted,
  isOpen,
  vouchers,
}: PlaceCardProps): JSX.Element => {
  const { t } = useTranslation();
  const touchStartX = useRef(0);

  const resolvedImageUri =
    imageUri ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(branch.name)}&background=a1d973&color=fff&size=300`;

  const distanceLabel =
    branch.distanceKm != null
      ? branch.distanceKm < 1
        ? `${Math.round(branch.distanceKm * 1000)} m`
        : `${branch.distanceKm.toFixed(1)} km`
      : null;

  return (
    <View className="h-fit overflow-hidden rounded-[16.81px] border border-[#ededed] bg-white">
      <TouchableOpacity onPress={onPress}>
        <View className="p-[6.31px]">
          <View className="relative h-[117.7px] w-full overflow-hidden rounded-t-[14.71px]">
            <Image
              className="h-full w-full"
              source={{ uri: resolvedImageUri }}
              resizeMode="cover"
            />
            <View className="absolute right-2 top-2 h-[23px] w-[23px] items-center justify-center rounded-full bg-[#EE6612]">
              <MaterialCommunityIcons name="bookmark" size={14} color="#fff" />
            </View>
            {isFlashBoosted && (
              <View className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-[#F59E0B] px-2 py-0.5">
                <Ionicons name="flash" size={10} color="#fff" />
                <Text className="text-[9px] font-bold text-white">BOOST</Text>
              </View>
            )}
            {tier && (
              <View
                className="absolute bottom-2 right-2 rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: TIER_COLORS[tier] + '22' }}
              >
                <Text className="text-[10px]">{TIER_ICONS[tier]}</Text>
              </View>
            )}
          </View>

          <View className="rounded-b-[14.71px] bg-white px-[8.41px] py-[4.2px]">
            <Text
              className="font-nunito -mt-[1.05px] min-h-[36px] py-1 text-[12.6px] font-bold leading-[18px] text-black"
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

            <View className="flex-row items-center gap-[6px] py-1">
              <MaterialCommunityIcons
                name="star"
                size={13}
                color={'rgba(250,204,21,1)'}
              />
              <Text className="font-comfortaa text-[12px] font-semibold leading-[14px] text-[rgba(250,204,21,1)]">
                {branch.avgRating.toFixed(1)}
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

            <View className="flex-row items-center gap-[4.2px] pt-1">
              <MaterialCommunityIcons
                name="map-marker"
                size={13}
                color="#a5cf7bff"
              />
              <Text
                className="font-nunito -mt-[1.05px] flex-1 text-[11px] font-medium leading-[16px] text-[#979797]"
                numberOfLines={2}
              >
                {branch.addressDetail}
              </Text>
            </View>

            {isOpen !== undefined && (
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
        </View>
      </TouchableOpacity>

      {vouchers && vouchers.length > 0 && (
        <View
          onTouchStart={(e) => { touchStartX.current = e.nativeEvent.pageX; }}
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
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 6, paddingTop: 0, gap: 4 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center overflow-hidden rounded-md border border-[#EE6612]/20 bg-[#FFF8F5]">
              <View className="items-center justify-center self-stretch bg-[#EE6612] px-1.5">
                <MaterialCommunityIcons
                  name="ticket-percent"
                  size={10}
                  color="#fff"
                />
              </View>
              <View className="gap-2 px-2 py-1.5">
                <Text className="text-[9px] font-bold text-[#EE6612]">
                  {t('voucher.discount')}{' '}
                  {formatVoucherDiscount(item.discountValue, item.type)}
                </Text>
                {!!item.minAmountRequired && (
                  <Text className="text-[9px] text-[#EE6612]">
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
  );
};
