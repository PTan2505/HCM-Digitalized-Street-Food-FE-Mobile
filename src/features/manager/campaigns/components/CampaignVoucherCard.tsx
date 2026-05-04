import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CampaignVoucherDto } from '@features/customer/campaigns/api/voucherApi';
import type { ManagerVoucher } from '@manager/vouchers/api/managerVoucherApi';
import { VoucherStatusBadge } from '@manager/vouchers/components/VoucherStatusBadge';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type VoucherSource = CampaignVoucherDto | ManagerVoucher;

interface Props {
  voucher: VoucherSource;
  onEdit?: (voucherId: number) => void;
  onDelete?: (voucherId: number) => void;
}

const getId = (v: VoucherSource): number =>
  'voucherId' in v && typeof v.voucherId === 'number' ? v.voucherId : 0;

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount
  );

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const CampaignVoucherCard = ({
  voucher,
  onEdit,
  onDelete,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const isPercent = voucher.type === 'PERCENT';
  const remaining = Math.max(voucher.quantity - (voucher.usedQuantity ?? 0), 0);
  const id = getId(voucher);
  const showActions = onEdit !== undefined || onDelete !== undefined;

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
          <VoucherStatusBadge voucher={voucher} />
        </View>

        {voucher.minAmountRequired > 0 && (
          <Text className="mt-1 text-xs text-gray-400">
            {t('manager_campaigns.min_order', {
              amount: formatCurrency(voucher.minAmountRequired),
            })}
          </Text>
        )}

        {showActions ? (
          <View className="mt-3 flex-row gap-2">
            {onEdit ? (
              <TouchableOpacity
                onPress={() => onEdit(id)}
                className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5"
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={14}
                  color="#9FD356"
                />
                <Text className="text-xs font-semibold text-primary">
                  {t('manager_campaigns.edit')}
                </Text>
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity
                onPress={() => onDelete(id)}
                className="flex-row items-center gap-1 rounded-full bg-red-50 px-3 py-1.5"
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={14}
                  color="#EF4444"
                />
                <Text className="text-xs font-semibold text-red-500">
                  {t('common.remove')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
};
