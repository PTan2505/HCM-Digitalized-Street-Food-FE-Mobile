import { Ionicons } from '@expo/vector-icons';
import type { Voucher } from '@slices/campaigns';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface VoucherCardProps {
  voucher: Voucher;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isExpanded: boolean;
  onPress: () => void;
}

export const VoucherCard = ({
  voucher,
  isExpired,
  isExpiringSoon,
  isExpanded,
  onPress,
}: VoucherCardProps): JSX.Element => {
  const { t } = useTranslation();

  const discountLabel =
    voucher.discountType === 'percentage'
      ? `${voucher.discountValue}%`
      : `${voucher.discountValue.toLocaleString()}đ`;

  const expiryDate = new Date(voucher.expiresAt).toLocaleDateString();

  const scopeLabel =
    voucher.source === 'system'
      ? t('campaign.scope_participating')
      : t('campaign.scope_restaurant', { name: voucher.vendorName ?? '' });

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-3 overflow-hidden rounded-xl border ${
        isExpired ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white'
      } shadow-sm`}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Discount badge */}
        <View
          className={`w-20 items-center justify-center ${
            isExpired ? 'bg-gray-200' : 'bg-[#a1d973]'
          }`}
        >
          <Text
            className={`text-lg font-bold ${isExpired ? 'text-gray-400' : 'text-white'}`}
          >
            {discountLabel}
          </Text>
          <Text
            className={`text-xs ${isExpired ? 'text-gray-400' : 'text-white/80'}`}
          >
            {t('campaign.off')}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1 p-3">
          <View className="flex-row items-center">
            <Text
              className={`flex-1 text-sm font-bold ${isExpired ? 'text-gray-400' : 'text-gray-900'}`}
              numberOfLines={1}
            >
              {voucher.title}
            </Text>
            {isExpired && (
              <View className="ml-2 rounded bg-gray-300 px-1.5 py-0.5">
                <Text className="text-xs text-gray-500">
                  {t('campaign.expired')}
                </Text>
              </View>
            )}
            {isExpiringSoon && !isExpired && (
              <View className="ml-2 rounded bg-amber-100 px-1.5 py-0.5">
                <Text className="text-xs text-amber-600">
                  {t('campaign.expiring_soon')}
                </Text>
              </View>
            )}
          </View>

          <Text className="mt-0.5 text-xs text-gray-400">
            {voucher.source === 'system'
              ? voucher.campaignName
              : voucher.vendorName}
          </Text>

          <View className="mt-1 flex-row items-center">
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text className="ml-1 text-xs text-gray-400">
              {t('campaign.expires')}: {expiryDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded details */}
      {isExpanded && (
        <View className="border-t border-dashed border-gray-200 px-4 py-3">
          <Text className="mb-1 text-xs text-gray-500">{scopeLabel}</Text>
          {voucher.minOrderValueVnd != null && (
            <Text className="text-xs text-gray-400">
              {t('campaign.min_order')}:{' '}
              {voucher.minOrderValueVnd.toLocaleString()}đ
            </Text>
          )}
          {voucher.description && (
            <Text className="mt-1 text-xs text-gray-400">
              {voucher.description}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
