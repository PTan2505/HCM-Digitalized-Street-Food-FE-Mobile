import Header from '@components/Header';
import type { CampaignVoucherDto } from '@features/customer/campaigns/api/voucherApi';
import { TicketVoucherCard } from '@features/customer/campaigns/components/TicketVoucherCard';
import {
  useCampaignVouchers,
  useRestaurantCampaigns,
} from '@features/customer/campaigns/hooks/useRestaurantCampaigns';
import { Ionicons } from '@expo/vector-icons';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBackground, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RestaurantCampaignDetailScreenProps = StaticScreenProps<{
  campaignId: string;
}>;

const formatDiscount = (voucher: CampaignVoucherDto): string => {
  if (voucher.type.toUpperCase() === 'PERCENT') {
    return `${voucher.discountValue}%`;
  }
  return `${voucher.discountValue.toLocaleString('vi-VN')}đ`;
};

export const RestaurantCampaignDetailScreen = ({
  route,
}: RestaurantCampaignDetailScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { campaignId } = route.params;

  const { campaign } = useRestaurantCampaigns(campaignId);
  const { vouchers, isLoading: isVouchersLoading } =
    useCampaignVouchers(campaignId);

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

  const startDate = new Date(campaign.startDate).toLocaleDateString();
  const endDate = new Date(campaign.endDate).toLocaleDateString();
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000)
  );
  const campaignStatusLabel =
    daysLeft === 0
      ? t('campaign.expired')
      : `${t('campaign.remaining', { count: daysLeft })}`;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('campaign.restaurant_detail')}
        onBackPress={(): void => navigation.goBack()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 mt-4 overflow-hidden rounded-3xl">
          <ImageBackground
            source={{ uri: campaign.imageUrl }}
            className="w-full"
            resizeMode="cover"
            style={{ minHeight: 260 }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.8)']}
              locations={[0, 0.72]}
              style={{ flex: 1, justifyContent: 'flex-end', padding: 18 }}
            >
              <View className="mb-3 flex-row items-center gap-2">
                <View className="self-start rounded-full bg-primary px-3 py-1">
                  <Text className="text-sm font-bold text-white">
                    {t('campaign.merchant_promo')}
                  </Text>
                </View>
                <View className="self-start rounded-full bg-black/35 px-3 py-1">
                  <Text className="text-sm font-semibold text-white">
                    {campaignStatusLabel}
                  </Text>
                </View>
              </View>

              <Text className="mb-3 text-3xl font-extrabold leading-9 text-white shadow-sm shadow-black">
                {campaign.name}
              </Text>

              <View className="self-start rounded-xl border border-white/20 bg-white/15 px-3 py-2">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="white" />
                  <Text className="ml-2 text-sm font-medium text-white/95">
                    {startDate} - {endDate}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View className="mx-4 mt-4 rounded-2xl border border-gray-100 bg-white p-4">
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-dark">
            {t('campaign.restaurant_detail')}
          </Text>
          <Text className="text-base leading-7 text-gray-700">
            {campaign.description}
          </Text>
        </View>

        <View className="mx-4 mt-4">
          <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-dark">
            {t('campaign.reward')}
          </Text>

          {isVouchersLoading ? (
            <View className="items-center py-6">
              <Text className="text-sm text-gray-400">
                {t('campaign.error')}
              </Text>
            </View>
          ) : vouchers.length === 0 ? (
            <View className="items-center rounded-2xl border border-gray-100 bg-white py-8">
              <Ionicons name="ticket-outline" size={36} color="#9ca3af" />
              <Text className="mt-2 text-sm text-gray-400">
                {t('campaign.voucher_empty')}
              </Text>
            </View>
          ) : (
            vouchers.map((voucher) => {
              const isSoldOut = voucher.remain <= 0;

              return (
                <TicketVoucherCard
                  key={voucher.voucherId}
                  disabled={isSoldOut}
                  discountText={formatDiscount(voucher)}
                  title={voucher.name}
                  subtitle={
                    voucher.maxDiscountValue
                      ? t('marketplace.max_discount', {
                          amount:
                            voucher.maxDiscountValue.toLocaleString('vi-VN'),
                        })
                      : null
                  }
                  expiresText={new Date(voucher.endDate).toLocaleDateString(
                    'vi-VN'
                  )}
                  secondaryMetaText={
                    isSoldOut
                      ? t('campaign.sold_out')
                      : t('marketplace.remaining', { count: voucher.remain })
                  }
                  tertiaryMetaText={
                    voucher.minAmountRequired > 0
                      ? t('campaign.min_order', {
                          amount:
                            voucher.minAmountRequired.toLocaleString('vi-VN'),
                        })
                      : undefined
                  }
                  footerText={
                    voucher.redeemPoint > 0
                      ? `${voucher.redeemPoint.toLocaleString('vi-VN')} ${t('marketplace.points')}`
                      : undefined
                  }
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
