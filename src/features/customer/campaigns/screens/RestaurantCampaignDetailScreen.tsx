import { Ionicons } from '@expo/vector-icons';
import { useRestaurantCampaigns } from '@features/customer/campaigns/hooks/useRestaurantCampaigns';
import { useVoucherWallet } from '@features/customer/campaigns/hooks/useVoucherWallet';
import type { DiscountType } from '@features/customer/campaigns/types/generated';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { Voucher } from '@features/customer/campaigns/types/voucher';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatDiscount = (
  type: DiscountType,
  value: number,
  t: (key: string) => string
): string => {
  if (type === 'percentage') return `${value}% ${t('campaign.off')}`;
  return `${value.toLocaleString()}đ ${t('campaign.off')}`;
};

type RestaurantCampaignDetailScreenProps = StaticScreenProps<{
  campaignId: string;
}>;

export const RestaurantCampaignDetailScreen = ({
  route,
}: RestaurantCampaignDetailScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { campaignId } = route.params;
  const [claimed, setClaimed] = useState(false);

  const { restaurantCampaigns } = useRestaurantCampaigns();
  const { handleClaimVoucher } = useVoucherWallet();

  const campaign = useMemo(
    () => restaurantCampaigns.find((c) => String(c.campaignId) === campaignId),
    [restaurantCampaigns, campaignId]
  );

  const handleClaim = useCallback(() => {
    if (!campaign) return;

    const voucher: Voucher = {
      userVoucherId: 0,
      voucherId: campaign.campaignId ?? 0,
      voucherCode: '',
      voucherName: campaign.name,
      description: campaign.description ?? null,
      voucherType:
        campaign.discountType === 'percentage' ? 'PERCENTAGE' : 'AMOUNT',
      discountValue: campaign.discountValue ?? 0,
      minAmountRequired: campaign.minOrderValueVnd ?? null,
      maxDiscountValue: null,
      startDate: null,
      endDate: campaign.expiresAt ?? null,
      isActive: true,
      campaignId: campaign.campaignId ?? null,
      quantity: 1,
      isAvailable: true,
    };

    handleClaimVoucher(voucher);
    setClaimed(true);
    Alert.alert(t('campaign.voucher_saved'), t('campaign.voucher_saved_desc'));
  }, [campaign, handleClaimVoucher, t]);

  if (!campaign) {
    return (
      <SafeAreaView
        edges={['top']}
        className="flex-1 items-center justify-center bg-white"
      >
        <Text className="text-gray-500">{t('campaign.not_found')}</Text>
      </SafeAreaView>
    );
  }

  const isSoldOut = campaign.remainingClaims === 0;
  const expiryDate = campaign.expiresAt
    ? new Date(campaign.expiresAt).toLocaleDateString()
    : '';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-gray-900">
          {t('campaign.restaurant_detail')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Vendor badge */}
        <View className="mb-3 self-start rounded-full bg-orange-100 px-3 py-1">
          <Text className="text-sm font-semibold text-orange-600">
            {t('campaign.merchant_promo')}
          </Text>
        </View>

        <Text className="mb-1 text-2xl font-bold text-gray-900">
          {campaign.name}
        </Text>

        <Text className="mb-4 text-base text-gray-500">
          {campaign.vendorName}
        </Text>

        {campaign.description && (
          <Text className="mb-4 text-base leading-6 text-gray-600">
            {campaign.description}
          </Text>
        )}

        {/* Discount info */}
        {campaign.discountType && campaign.discountValue && (
          <View className="mb-4 rounded-xl bg-green-50 p-4">
            <View className="flex-row items-center">
              <Ionicons name="pricetag-outline" size={20} color="#16A34A" />
              <Text className="ml-2 text-lg font-bold text-green-700">
                {formatDiscount(
                  campaign.discountType,
                  campaign.discountValue,
                  t
                )}
              </Text>
            </View>
            {campaign.minOrderValueVnd != null && (
              <Text className="mt-1 text-base text-green-600">
                {t('campaign.min_order')}:{' '}
                {campaign.minOrderValueVnd.toLocaleString()}đ
              </Text>
            )}
          </View>
        )}

        {/* Expiry */}
        <View className="mb-2 flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="ml-2 text-base text-gray-500">
            {t('campaign.expires')}: {expiryDate}
          </Text>
        </View>

        {/* Remaining claims */}
        {campaign.remainingClaims != null && (
          <View className="mb-4 flex-row items-center">
            <Ionicons name="ticket-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-base text-gray-500">
              {isSoldOut
                ? t('campaign.sold_out')
                : `${campaign.remainingClaims} ${t('campaign.remaining')}`}
            </Text>
          </View>
        )}

        {/* Scope */}
        <View className="mb-4 rounded-xl bg-gray-50 p-3">
          <Text className="text-sm text-gray-500">
            {t('campaign.scope_restaurant', {
              name: campaign.vendorName,
            })}
          </Text>
        </View>

        {/* Claim button */}
        <TouchableOpacity
          onPress={handleClaim}
          disabled={isSoldOut || claimed}
          className={`mt-2 items-center rounded-xl py-4 ${
            isSoldOut || claimed ? 'bg-gray-200' : 'bg-primary'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-base font-bold ${
              isSoldOut || claimed ? 'text-gray-400' : 'text-white'
            }`}
          >
            {isSoldOut
              ? t('campaign.sold_out')
              : claimed
                ? t('campaign.voucher_saved')
                : t('campaign.save_voucher')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
