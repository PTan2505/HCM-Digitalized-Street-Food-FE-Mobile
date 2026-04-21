import { MANAGER_ORDER_STATUS } from '@manager/api/managerOrderApi';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface OrderStatusBadgeProps {
  status: number;
}

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
}

export const OrderStatusBadge = ({
  status,
}: OrderStatusBadgeProps): React.JSX.Element => {
  const { t } = useTranslation();

  const configs: Record<number, StatusConfig> = {
    [MANAGER_ORDER_STATUS.AwaitingVendorConfirmation]: {
      label: t('manager_orders.status_pending'),
      bg: '#FD7120',
      text: '#5B2100',
    },
    [MANAGER_ORDER_STATUS.Paid]: {
      label: t('manager_orders.status_preparing'),
      bg: '#DBEAFE',
      text: '#1E40AF',
    },
    [MANAGER_ORDER_STATUS.Complete]: {
      label: t('manager_orders.status_completed'),
      bg: '#E7E9DB',
      text: '#434939',
    },
  };

  const config = configs[status] ?? {
    label: String(status),
    bg: '#E7E9DB',
    text: '#434939',
  };

  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: config.bg }}
    >
      <Text className="text-xs font-semibold" style={{ color: config.text }}>
        {config.label}
      </Text>
    </View>
  );
};
