import { Ionicons } from '@expo/vector-icons';
import type {
  RestaurantCampaign,
  SystemCampaign,
} from '@features/customer/campaigns/types/generated';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

type CampaignCardProps =
  | {
      campaign: SystemCampaign;
      type: 'system';
      onPress: () => void;
    }
  | {
      campaign: RestaurantCampaign;
      type: 'restaurant';
      onPress: () => void;
    };

export const CampaignCard = ({
  campaign,
  type,
  onPress,
}: CampaignCardProps): JSX.Element => {
  const { t } = useTranslation();

  if (type === 'system') {
    const sys = campaign;
    const startDate = new Date(sys.startDate).toLocaleDateString();
    const endDate = new Date(sys.endDate).toLocaleDateString();

    return (
      <TouchableOpacity
        onPress={onPress}
        className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        activeOpacity={0.7}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <View className="rounded-full bg-primary/20 px-2 py-0.5">
            <Text className="text-sm font-semibold text-primary-light">
              {t('campaign.platform_event')}
            </Text>
          </View>
        </View>

        <Text className="mb-1 text-base font-bold text-gray-900">
          {sys.name}
        </Text>
        <Text className="mb-2 text-base text-gray-500" numberOfLines={2}>
          {sys.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text className="ml-1 text-sm text-gray-400">
              {startDate} - {endDate}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Restaurant campaign
  const rest = campaign;
  const expiryDate = rest.expiresAt
    ? new Date(rest.expiresAt).toLocaleDateString()
    : '';
  const discountLabel =
    rest.discountType === 'percentage'
      ? `${rest.discountValue ?? 0}%`
      : `${rest.discountValue?.toLocaleString() ?? '0'}đ`;
  const isSoldOut = rest.remainingClaims === 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="rounded-full bg-orange-100 px-2 py-0.5">
          <Text className="text-sm font-semibold text-orange-600">
            {t('campaign.merchant_promo')}
          </Text>
        </View>
        {rest.discountType && rest.discountValue && (
          <View className="rounded-full bg-green-100 px-2 py-0.5">
            <Text className="text-sm font-bold text-green-700">
              {discountLabel} {t('campaign.off')}
            </Text>
          </View>
        )}
      </View>

      <Text className="mb-0.5 text-base font-bold text-gray-900">
        {rest.name}
      </Text>
      <Text className="mb-2 text-base text-gray-500">{rest.vendorName}</Text>

      <View className="flex-row items-center justify-between">
        {rest.expiresAt && (
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="ml-1 text-sm text-gray-400">
              {t('campaign.expires')}: {expiryDate}
            </Text>
          </View>
        )}
        {rest.remainingClaims != null && (
          <Text
            className={`text-sm font-semibold ${isSoldOut ? 'text-red-500' : 'text-gray-400'}`}
          >
            {isSoldOut
              ? t('campaign.sold_out')
              : `${rest.remainingClaims} ${t('campaign.remaining')}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
