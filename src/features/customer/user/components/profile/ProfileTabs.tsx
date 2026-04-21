import { ProfileTab } from '@features/customer/user/types/profileConfig';
import React, { JSX, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProfileTabsProps {
  tabs: ProfileTab[];
  onTabChange?: (tabId: string) => void;
}

export const ProfileTabs = ({
  tabs,
  onTabChange,
}: ProfileTabsProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');

  const handleTabPress = (tabId: string): void => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <View className="flex-row gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            className={`flex-1 rounded-full px-4 py-3 ${
              isActive ? 'bg-primary' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center text-base font-semibold ${
                isActive ? 'text-white' : 'text-gray-600'
              }`}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
