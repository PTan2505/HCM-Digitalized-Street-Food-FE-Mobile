import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
  isRegisterable?: boolean;
}

export const CampaignStatusBadge = ({
  isActive,
  isRegisterable,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();

  if (isRegisterable) {
    return (
      <View className="rounded-full bg-blue-100 px-2.5 py-0.5">
        <Text className="text-xs font-semibold text-blue-700">
          {t('manager_campaigns.status_registerable')}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`rounded-full px-2.5 py-0.5 ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}
    >
      <Text
        className={`text-xs font-semibold ${isActive ? 'text-green-700' : 'text-gray-500'}`}
      >
        {isActive
          ? t('manager_campaigns.status_active')
          : t('manager_campaigns.status_inactive')}
      </Text>
    </View>
  );
};
