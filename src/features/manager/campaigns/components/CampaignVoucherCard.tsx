import type { CampaignVoucherDto } from '@features/customer/campaigns/api/voucherApi';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  voucher: CampaignVoucherDto;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount
  );

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const CampaignVoucherCard = ({ voucher }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const isPercent = voucher.type === 'PERCENT';
  const remaining = Math.max(voucher.quantity - (voucher.usedQuantity ?? 0), 0);

  return (
    <View className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <View className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1">
        <Text className="text-xs font-bold text-white">
          {isPercent
            ? `-${voucher.discountValue}%`
            : `-${formatCurrency(voucher.discountValue)}`}
        </Text>
      </View>

      <View className="p-4 pr-20">
        <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
          {voucher.name}
        </Text>
        <View className="mt-1 self-start rounded bg-gray-100 px-1.5 py-0.5">
          <Text className="text-xs font-semibold tracking-wider text-gray-600">
            {voucher.voucherCode}
          </Text>
        </View>

        <Text className="mt-2 text-xs text-gray-500">
          {formatDate(voucher.startDate)} → {formatDate(voucher.endDate)}
        </Text>

        <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
          <View className="rounded-full bg-gray-100 px-2 py-0.5">
            <Text className="text-xs font-semibold text-gray-600">
              {t('manager_campaigns.voucher_remaining', {
                count: remaining,
                total: voucher.quantity,
              })}
            </Text>
          </View>
          <View
            className={`rounded-full border px-2 py-0.5 ${
              voucher.isActive
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                voucher.isActive ? 'text-green-700' : 'text-red-500'
              }`}
            >
              {voucher.isActive
                ? t('manager_campaigns.status_active')
                : t('manager_campaigns.status_inactive')}
            </Text>
          </View>
        </View>

        {voucher.minAmountRequired > 0 && (
          <Text className="mt-1 text-xs text-gray-400">
            {t('manager_campaigns.min_order', {
              amount: formatCurrency(voucher.minAmountRequired),
            })}
          </Text>
        )}
      </View>
    </View>
  );
};
