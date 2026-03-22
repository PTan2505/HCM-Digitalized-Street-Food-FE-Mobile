import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

export type TabType = 'menu' | 'reviews' | 'nearby';

interface TabsBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabsBar = ({ activeTab, onTabChange }: TabsBarProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <View className="flex-row justify-center gap-2 border-b border-gray-200 px-4">
      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center gap-1 border-b-2 py-3 ${
          activeTab === 'menu' ? 'border-[#FF6B35]' : 'border-transparent'
        }`}
        onPress={() => onTabChange('menu')}
      >
        <Ionicons
          name="restaurant-outline"
          size={20}
          color={activeTab === 'menu' ? '#FF6B35' : '#999'}
        />
        <Text
          className={`text-[13px] ${
            activeTab === 'menu'
              ? 'font-semibold text-[#FF6B35]'
              : 'text-black-400'
          }`}
        >
          {t('tabs.menu')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center gap-1 border-b-2 py-3 ${
          activeTab === 'reviews' ? 'border-[#FF6B35]' : 'border-transparent'
        }`}
        onPress={() => onTabChange('reviews')}
      >
        <Ionicons
          name="chatbubble-outline"
          size={20}
          color={activeTab === 'reviews' ? '#FF6B35' : '#999'}
        />
        <Text
          className={`text-[13px] ${
            activeTab === 'reviews'
              ? 'font-semibold text-[#FF6B35]'
              : 'text-black-400'
          }`}
        >
          {t('tabs.reviews')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center gap-1 border-b-2 py-3 ${
          activeTab === 'nearby' ? 'border-[#FF6B35]' : 'border-transparent'
        }`}
        onPress={() => onTabChange('nearby')}
      >
        <Ionicons
          name="ticket-outline"
          size={20}
          color={activeTab === 'nearby' ? '#FF6B35' : '#999'}
        />
        <Text
          className={`text-[13px] ${
            activeTab === 'nearby'
              ? 'font-semibold text-[#FF6B35]'
              : 'text-black-400'
          }`}
        >
          {t('tabs.nearby')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabsBar;
