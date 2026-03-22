import type { JSX } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { VendorTier } from '@custom-types/vendor';
import { TierBadge } from '@components/TierBadge';

interface CurrentPickCardProps {
  id: string;
  name: string;
  rating: number;
  distance: string;
  priceRange: string;
  tag: string;
  image: ImageSourcePropType;
  likes: number;
  comments: number;
  isTopPick?: boolean;
  openStatus?: 'open' | 'closed';
  tier?: VendorTier;
  onPress?: () => void;
  onBookmarkPress?: () => void;
}

const CurrentPickCard = ({
  name,
  rating,
  distance,
  priceRange,
  tag,
  image,
  likes,
  comments,
  isTopPick,
  openStatus,
  tier,
  onBookmarkPress,
}: CurrentPickCardProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <View className="relative mb-5 flex-row rounded-[16px] border border-[#EEEEEE] bg-[#FFFFFF] px-3 py-[8px]">
      {isTopPick && (
        <View className="absolute -left-3.5 top-4 z-10">
          {/* Main ribbon */}
          <View
            className="rounded-r-md bg-[#ff6b35] px-4 py-1.5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 5,
            }}
          >
            <Text className="text-[10px] font-bold text-white">
              {t('actions.top_pick')}
            </Text>
          </View>
          {/* Ribbon fold effect */}
          <View
            className="absolute -bottom-3.5 left-0 h-0 w-0"
            style={{
              borderLeftWidth: 12,
              borderLeftColor: 'transparent',
              borderRightWidth: 0,
              borderRightColor: 'transparent',
              borderTopWidth: 12,
              borderTopColor: '#cc5429',
            }}
          />
        </View>
      )}
      <View className="mr-3">
        <Image
          source={image}
          className="h-[99px] w-[99px] rounded-xl bg-gray-100"
        />
      </View>

      <View className="flex-1 justify-start">
        <Text className="mb-1.5 text-[16px] font-semibold text-black">
          {name}
        </Text>

        <View className="mb-1.5 flex-row items-center">
          <Ionicons name="star" size={14} color="#ffc107" />
          <Text className="ml-1 text-[13px] font-medium text-[#ffc107]">
            {rating}
          </Text>
          <Text className="mx-1.5 text-[13px] text-gray-400">·</Text>
          <Text className="text-[13px] text-[#979797]">{distance}</Text>
        </View>

        <View className="mb-2 flex-row items-center gap-1">
          <Ionicons name="pricetag-outline" size={14} color="#06AA4C" />
          <Text className="text-[14px] font-bold text-[#06AA4C]">
            {priceRange}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="rounded-[16px] bg-[#06AA4C] px-2.5 py-1">
            <Text className="text-[11px] font-medium text-white">{tag}</Text>
          </View>
          {openStatus && (
            <View
              className={`rounded-full px-2 py-0.5 ${openStatus === 'open' ? 'bg-[#E8F5E9]' : 'bg-[#F3F4F6]'}`}
            >
              <Text
                className={`text-[10px] font-semibold ${openStatus === 'open' ? 'text-[#06AA4C]' : 'text-[#6B7280]'}`}
              >
                {openStatus === 'open'
                  ? t('actions.open')
                  : t('actions.closed')}
              </Text>
            </View>
          )}
          <TierBadge tier={tier} />
        </View>
      </View>

      <TouchableOpacity
        onPress={onBookmarkPress}
        className="absolute right-3 top-3 h-[22px] w-[22px] items-center justify-center rounded-full bg-[#EE6612CC]"
      >
        <Ionicons name="bookmark" size={12} color="white" />
      </TouchableOpacity>

      <View className="absolute bottom-3 right-3 h-[18.75] w-[65.625] flex-row items-center justify-center gap-2 rounded-[33.33px] bg-[#F3F3F2]">
        <View className="flex-row items-center gap-1">
          <Ionicons name="thumbs-up-outline" size={10.42} color="black" />
          <Text className="text-[10.42px] text-black">{likes}</Text>
        </View>
        <View className="h-[12px] w-[1px] bg-gray-400" />
        <View className="flex-row items-center gap-1">
          <Ionicons name="chatbubble-outline" size={10.42} color="black" />
          <Text className="text-[10.42px] text-black">{comments}</Text>
        </View>
      </View>
    </View>
  );
};

export default CurrentPickCard;
