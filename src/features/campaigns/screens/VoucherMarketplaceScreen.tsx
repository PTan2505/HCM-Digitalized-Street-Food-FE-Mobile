import { Ionicons } from '@expo/vector-icons';
import type { MarketplaceVoucherDto } from '@features/campaigns/api/voucherApi';
import { useVoucherMarketplace } from '@features/campaigns/hooks/useVoucherMarketplace';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(LinearGradient, {
  className: 'style',
});

const formatDiscount = (voucher: MarketplaceVoucherDto): string => {
  if (voucher.type.toUpperCase() === 'PERCENT') {
    return `${voucher.discountValue}%`;
  }
  return `${voucher.discountValue.toLocaleString('vi-VN')}đ`;
};

const remainingQuantity = (voucher: MarketplaceVoucherDto): number =>
  voucher.quantity - voucher.usedQuantity;

const displayExpiry = (voucher: MarketplaceVoucherDto): Date =>
  new Date(voucher.expiredDate ?? voucher.endDate);

interface MarketplaceCardProps {
  item: MarketplaceVoucherDto;
  userPoints: number;
  isRedeeming: boolean;
  onRedeem: (voucherId: number) => void;
}

const MarketplaceCard = ({
  item,
  userPoints,
  isRedeeming,
  onRedeem,
}: MarketplaceCardProps): JSX.Element => {
  const { t } = useTranslation();
  const remaining = remainingQuantity(item);
  const isSoldOut = remaining <= 0;
  const canAfford = userPoints >= item.redeemPoint;
  const disabled = isSoldOut || !canAfford || isRedeeming;
  const expiresAt = displayExpiry(item).toLocaleDateString('vi-VN');

  return (
    <View className="mb-4 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
      <LinearGradient
        colors={['#f4fcea', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-4 pt-3"
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View className="rounded-full bg-emerald-100 px-3 py-1">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {item.type}
            </Text>
          </View>
          <View className="rounded-full bg-white/80 px-3 py-1">
            <Text className="text-xs font-semibold text-gray-500">
              {t('marketplace.expires')} {expiresAt}
            </Text>
          </View>
        </View>

        <View className="mb-2 flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text
              className="text-lg font-extrabold text-gray-900"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {item.description ? (
              <Text
                className="mt-1 text-xs leading-5 text-gray-500"
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : null}
          </View>

          <View className="rounded-2xl bg-emerald-600 px-3 py-2">
            <Text className="text-lg font-extrabold text-white">
              {formatDiscount(item)}
            </Text>
            {item.maxDiscountValue ? (
              <Text className="text-[10px] font-medium text-emerald-100">
                {t('marketplace.max_discount', {
                  amount: item.maxDiscountValue.toLocaleString('vi-VN'),
                })}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="mb-4 flex-row flex-wrap gap-2">
          {item.minAmountRequired > 0 ? (
            <View className="flex-row items-center rounded-full border border-gray-200 bg-white px-3 py-1">
              <Ionicons name="receipt-outline" size={12} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-600">
                {t('marketplace.min_order', {
                  amount: item.minAmountRequired.toLocaleString('vi-VN'),
                })}
              </Text>
            </View>
          ) : null}

          <View
            className={`flex-row items-center rounded-full px-3 py-1 ${
              isSoldOut ? 'bg-rose-50' : 'bg-emerald-50'
            }`}
          >
            <Ionicons
              name={isSoldOut ? 'alert-circle-outline' : 'layers-outline'}
              size={12}
              color={isSoldOut ? '#E11D48' : '#059669'}
            />
            <Text
              className={`ml-1 text-xs font-semibold ${
                isSoldOut ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {isSoldOut
                ? t('marketplace.sold_out')
                : t('marketplace.remaining', { count: remaining })}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="rounded-xl bg-amber-50 px-3 py-2">
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="ml-1 text-sm font-bold text-amber-700">
                {item.redeemPoint.toLocaleString('vi-VN')}{' '}
                {t('marketplace.points')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => onRedeem(item.voucherId)}
            disabled={disabled}
            className={`min-w-[112px] flex-row items-center justify-center rounded-full px-4 py-2.5 ${
              isSoldOut || !canAfford
                ? 'bg-gray-200'
                : isRedeeming
                  ? 'bg-[#c5e89a]'
                  : 'bg-[#7ab82d]'
            }`}
          >
            {isRedeeming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={
                    isSoldOut || !canAfford ? 'ban-outline' : 'sparkles-outline'
                  }
                  size={14}
                  color={isSoldOut || !canAfford ? '#9CA3AF' : '#FFFFFF'}
                />
                <Text
                  className={`ml-1 text-xs font-extrabold ${
                    isSoldOut || !canAfford ? 'text-gray-400' : 'text-white'
                  }`}
                >
                  {isSoldOut
                    ? t('marketplace.sold_out')
                    : !canAfford
                      ? t('marketplace.not_enough_points')
                      : t('marketplace.redeem')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export const VoucherMarketplaceScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    vouchers,
    isLoading,
    error,
    userPoints,
    redeemState,
    handleRedeem,
    clearRedeemState,
    handleRefresh,
  } = useVoucherMarketplace();

  useEffect(() => {
    if (redeemState.success) {
      Alert.alert(
        t('marketplace.redeem_success_title'),
        t('marketplace.redeem_success_desc'),
        [{ text: t('common.ok'), onPress: clearRedeemState }]
      );
    } else if (redeemState.error) {
      Alert.alert(t('common.error'), redeemState.error, [
        { text: t('common.ok'), onPress: clearRedeemState },
      ]);
    }
  }, [redeemState.success, redeemState.error, clearRedeemState, t]);

  const confirmRedeem = (voucher: MarketplaceVoucherDto): void => {
    Alert.alert(
      t('marketplace.confirm_title'),
      t('marketplace.confirm_desc', {
        name: voucher.name,
        points: voucher.redeemPoint.toLocaleString('vi-VN'),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('marketplace.redeem'),
          onPress: (): void => void handleRedeem(voucher.voucherId),
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Points banner */}
      <View className="mx-4 mt-3 flex-row items-center rounded-xl bg-amber-50 px-4 py-3">
        <Ionicons name="star" size={20} color="#F59E0B" />
        <Text className="ml-2 text-sm font-semibold text-amber-700">
          {t('marketplace.your_points', {
            points: userPoints.toLocaleString('vi-VN'),
          })}
        </Text>
      </View>

      {/* Content */}
      {isLoading && vouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : error && vouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
          <Text className="mt-3 text-center text-sm text-gray-400">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => void handleRefresh()}
            className="mt-4 rounded-full bg-[#a1d973] px-6 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              {t('campaign.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : vouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="storefront-outline" size={56} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {t('marketplace.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => String(item.voucherId)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void handleRefresh()}
              tintColor="#a1d973"
              colors={['#a1d973']}
            />
          }
          renderItem={({ item }) => (
            <MarketplaceCard
              item={item}
              userPoints={userPoints}
              isRedeeming={
                redeemState.voucherId === item.voucherId && redeemState.loading
              }
              onRedeem={() => confirmRedeem(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};
