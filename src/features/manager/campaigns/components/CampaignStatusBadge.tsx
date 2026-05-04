import {
  computeCampaignStatus,
  type CampaignStatusInput,
  type CampaignStatusKey,
} from '@manager/campaigns/hooks/useCampaignStatus';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = CampaignStatusInput;

const STYLES: Record<
  CampaignStatusKey,
  { container: string; text: string; key: string }
> = {
  active: {
    container: 'bg-green-100',
    text: 'text-green-700',
    key: 'manager_campaigns.status_active',
  },
  registerable: {
    container: 'bg-blue-100',
    text: 'text-blue-700',
    key: 'manager_campaigns.status_registerable',
  },
  notStarted: {
    container: 'bg-gray-100',
    text: 'text-gray-500',
    key: 'manager_campaigns.status_not_started',
  },
  pendingStart: {
    container: 'bg-amber-100',
    text: 'text-amber-700',
    key: 'manager_campaigns.status_pending_start',
  },
  ended: {
    container: 'bg-red-100',
    text: 'text-red-600',
    key: 'manager_campaigns.status_ended',
  },
  inactive: {
    container: 'bg-gray-100',
    text: 'text-gray-500',
    key: 'manager_campaigns.status_inactive',
  },
  upcoming: {
    container: 'bg-amber-100',
    text: 'text-amber-700',
    key: 'manager_campaigns.status_upcoming',
  },
};

export const CampaignStatusBadge = (props: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const status = computeCampaignStatus(props);
  const style = STYLES[status];
  return (
    <View className={`rounded-full px-2.5 py-0.5 ${style.container}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>
        {t(style.key)}
      </Text>
    </View>
  );
};
