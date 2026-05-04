import type { ManagerVoucher } from '@manager/vouchers/api/managerVoucherApi';
import type { CampaignVoucherDto } from '@features/customer/campaigns/api/voucherApi';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type VoucherLike = Pick<
  ManagerVoucher,
  'isActive' | 'startDate' | 'endDate' | 'quantity' | 'usedQuantity'
>;

interface Props {
  voucher: VoucherLike | CampaignVoucherDto;
}

type Status = 'soldOut' | 'inactive' | 'upcoming' | 'ended' | 'active';

const computeStatus = (voucher: VoucherLike): Status => {
  const remaining = voucher.quantity - (voucher.usedQuantity ?? 0);
  if (remaining <= 0) return 'soldOut';
  if (!voucher.isActive) return 'inactive';
  const now = Date.now();
  const start = new Date(voucher.startDate).getTime();
  const end = new Date(voucher.endDate).getTime();
  if (!isNaN(start) && now < start) return 'upcoming';
  if (!isNaN(end) && now > end) return 'ended';
  return 'active';
};

const STYLES: Record<
  Status,
  { container: string; text: string; key: string }
> = {
  soldOut: {
    container: 'border-orange-200 bg-orange-50',
    text: 'text-orange-600',
    key: 'manager_vouchers.status_sold_out',
  },
  inactive: {
    container: 'border-red-200 bg-red-50',
    text: 'text-red-500',
    key: 'manager_vouchers.status_paused',
  },
  upcoming: {
    container: 'border-blue-200 bg-blue-50',
    text: 'text-blue-700',
    key: 'manager_vouchers.status_upcoming',
  },
  ended: {
    container: 'border-gray-200 bg-gray-100',
    text: 'text-gray-600',
    key: 'manager_vouchers.status_ended',
  },
  active: {
    container: 'border-green-200 bg-green-50',
    text: 'text-green-700',
    key: 'manager_vouchers.status_active',
  },
};

export const VoucherStatusBadge = ({ voucher }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const status = computeStatus(voucher as VoucherLike);
  const style = STYLES[status];
  return (
    <View className={`rounded-full border px-2 py-0.5 ${style.container}`}>
      <Text className={`text-xs font-bold ${style.text}`}>{t(style.key)}</Text>
    </View>
  );
};
