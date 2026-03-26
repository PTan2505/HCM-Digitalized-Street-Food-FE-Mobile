import { Ionicons } from '@expo/vector-icons';
import type {
  RestaurantCampaign,
  SystemCampaign,
} from '@features/campaigns/types/generated';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

const width = Dimensions.get('window').width;
const BANNER_HEIGHT = Math.round(width / 2);
const BANNER_ITEM_WIDTH = width;

export type BannerItem =
  | { type: 'image'; uri: string }
  | { type: 'system_campaign'; data: SystemCampaign; imageUri: string }
  | { type: 'restaurant_campaign'; data: RestaurantCampaign; imageUri: string };

interface BannerCarouselProps {
  items: BannerItem[];
  onCampaignPress?: (
    campaignId: string,
    campaignType: 'system' | 'restaurant'
  ) => void;
}

const BannerCarousel = ({
  items,
  onCampaignPress,
}: BannerCarouselProps): JSX.Element => {
  const { t } = useTranslation();
  const progress = useSharedValue<number>(0);

  if (items.length === 0) return <View />;

  return (
    <View style={{ height: BANNER_HEIGHT, overflow: 'hidden' }}>
      <Carousel
        style={{ width, height: BANNER_HEIGHT }}
        data={items}
        onProgressChange={progress}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({ item }) => {
          if (item.type === 'image') {
            // Skip rendering if URI is empty
            if (!item.uri || item.uri.trim() === '') {
              return <View />;
            }
            return (
              <View className="flex flex-1 justify-center">
                <Image
                  source={{ uri: item.uri }}
                  style={{ width, height: BANNER_HEIGHT }}
                  resizeMode="cover"
                  className="rounded-[14px]"
                />
              </View>
            );
          }

          if (item.type === 'system_campaign') {
            const c = item.data;
            // Skip rendering if imageUri is empty
            if (!item.imageUri || item.imageUri.trim() === '') {
              return <View />;
            }
            return (
              <TouchableOpacity
                onPress={() =>
                  onCampaignPress?.(String(c.campaignId), 'system')
                }
                activeOpacity={0.85}
                className="flex flex-1 justify-center"
              >
                <ImageBackground
                  source={{ uri: item.imageUri }}
                  style={{ width: BANNER_ITEM_WIDTH, height: BANNER_HEIGHT }}
                  imageStyle={{ borderRadius: 14 }}
                  resizeMode="cover"
                >
                  <View className="flex-1 rounded-[14px] bg-black/40 p-4">
                    <View className="mb-2 self-start rounded-full bg-white/30 px-2 py-0.5">
                      <Text className="text-xs font-semibold text-white">
                        {t('campaign.platform_event')}
                      </Text>
                    </View>
                    <Text
                      className="mb-1 text-lg font-bold text-white"
                      numberOfLines={2}
                    >
                      {c.name}
                    </Text>
                    <Text
                      className="mb-2 text-sm text-white/80"
                      numberOfLines={2}
                    >
                      {c.description}
                    </Text>
                    <View className="mt-auto flex-row items-center justify-end">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="arrow-forward-circle-outline"
                          size={16}
                          color="#fff"
                        />
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          }

          // restaurant_campaign
          const rc = item.data;
          // Skip rendering if imageUri is empty
          if (!item.imageUri || item.imageUri.trim() === '') {
            return <View />;
          }
          const discountLabel =
            rc.discountType === 'percentage'
              ? `${rc.discountValue}%`
              : `${rc.discountValue?.toLocaleString()}đ`;

          return (
            <TouchableOpacity
              onPress={() =>
                onCampaignPress?.(String(rc.campaignId), 'restaurant')
              }
              activeOpacity={0.85}
              className="flex flex-1 justify-center"
            >
              <ImageBackground
                source={{ uri: item.imageUri }}
                style={{ width: BANNER_ITEM_WIDTH, height: BANNER_HEIGHT }}
                imageStyle={{ borderRadius: 14 }}
                resizeMode="cover"
              >
                <View className="flex-1 rounded-[14px] bg-black/40 p-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <View className="rounded-full bg-white/30 px-2 py-0.5">
                      <Text className="text-xs font-semibold text-white">
                        {t('campaign.merchant_promo')}
                      </Text>
                    </View>
                    {rc.discountType && rc.discountValue && (
                      <View className="rounded-full bg-white/30 px-2 py-0.5">
                        <Text className="text-xs font-bold text-white">
                          {discountLabel} {t('campaign.off')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className="mb-1 text-lg font-bold text-white"
                    numberOfLines={2}
                  >
                    {rc.name}
                  </Text>
                  <Text className="mb-2 text-sm text-white/80">
                    {rc.vendorName ?? rc.description}
                  </Text>
                  <View className="mt-auto flex-row items-center justify-between">
                    {rc.expiresAt && (
                      <Text className="text-xs text-white/70">
                        {t('campaign.expires')}:{' '}
                        {new Date(rc.expiresAt).toLocaleDateString()}
                      </Text>
                    )}
                    <View className="flex-row items-center">
                      <Ionicons
                        name="arrow-forward-circle-outline"
                        size={16}
                        color="#fff"
                      />
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default BannerCarousel;
