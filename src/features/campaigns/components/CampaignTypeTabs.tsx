import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface CampaignTypeTabsProps {
  activeTab: 'system' | 'restaurant';
  onTabChange: (tab: 'system' | 'restaurant') => void;
}

export const CampaignTypeTabs = ({
  activeTab,
  onTabChange,
}: CampaignTypeTabsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <View className="flex-row border-b border-gray-200 px-4">
      <TouchableOpacity
        onPress={() => onTabChange('system')}
        className={`mr-6 pb-3 ${activeTab === 'system' ? 'border-b-2 border-[#a1d973]' : ''}`}
        activeOpacity={0.7}
      >
        <Text
          className={`text-sm font-semibold ${
            activeTab === 'system' ? 'text-[#7AB82D]' : 'text-gray-400'
          }`}
        >
          {t('campaign.tab_system')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onTabChange('restaurant')}
        className={`pb-3 ${activeTab === 'restaurant' ? 'border-b-2 border-[#a1d973]' : ''}`}
        activeOpacity={0.7}
      >
        <Text
          className={`text-sm font-semibold ${
            activeTab === 'restaurant' ? 'text-[#7AB82D]' : 'text-gray-400'
          }`}
        >
          {t('campaign.tab_restaurant')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
