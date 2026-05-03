import { CampaignStatusBadge } from '@manager/campaigns/components/CampaignStatusBadge';
import type { VendorCampaign } from '@manager/campaigns/api/managerCampaignApi';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  campaign: VendorCampaign;
  onPress: () => void;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const CampaignCard = ({
  campaign,
  onPress,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <Text
          className="flex-1 pr-2 text-base font-bold text-gray-900"
          numberOfLines={2}
        >
          {campaign.name}
        </Text>
        <CampaignStatusBadge isActive={campaign.isActive} />
      </View>
      {campaign.description ? (
        <Text className="mb-2 text-xs text-gray-500" numberOfLines={2}>
          {campaign.description}
        </Text>
      ) : null}
      <Text className="text-xs text-gray-400">
        {t('manager_campaigns.date_range', {
          from: formatDate(campaign.startDate),
          to: formatDate(campaign.endDate),
        })}
      </Text>
    </TouchableOpacity>
  );
};
