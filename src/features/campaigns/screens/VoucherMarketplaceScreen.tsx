import { Ionicons } from '@expo/vector-icons';
import type { MarketplaceVoucherDto } from '@features/campaigns/api/voucherApi';
import { TicketVoucherCard } from '@features/campaigns/components/TicketVoucherCard';
import { useVoucherMarketplace } from '@features/campaigns/hooks/useVoucherMarketplace';
import { useNavigation } from '@react-navigation/native';
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
    <TicketVoucherCard
      disabled={disabled}
      discountText={formatDiscount(item)}
      title={item.name}
      subtitle={
        item.maxDiscountValue
          ? t('marketplace.max_discount', {
              amount: item.maxDiscountValue.toLocaleString('vi-VN'),
            })
          : undefined
      }
      expiresText={expiresAt}
      secondaryMetaText={
        isSoldOut
          ? t('marketplace.sold_out')
          : t('marketplace.remaining', { count: remaining })
      }
      tertiaryMetaText={
        item.minAmountRequired > 0
          ? t('marketplace.min_order', {
              amount: item.minAmountRequired.toLocaleString('vi-VN'),
            })
          : undefined
      }
      footerText={`${item.redeemPoint.toLocaleString('vi-VN')} ${t('marketplace.points')}`}
      actionLabel={
        isSoldOut
          ? t('marketplace.sold_out')
          : !canAfford
            ? t('marketplace.not_enough_points')
            : t('marketplace.redeem')
      }
      onActionPress={() => onRedeem(item.voucherId)}
      isActionLoading={isRedeeming}
      actionDisabled={disabled}
    />
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

  const availableVouchers = vouchers.filter(
    (voucher) => remainingQuantity(voucher) > 0
  );

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
      <View className="flex-row items-center bg-transparent px-4 py-3">
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
      {isLoading && availableVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : error && availableVouchers.length === 0 ? (
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
      ) : availableVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="storefront-outline" size={56} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {t('marketplace.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableVouchers}
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
