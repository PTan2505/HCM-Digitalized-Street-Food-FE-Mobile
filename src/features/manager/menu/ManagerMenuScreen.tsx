import Header from '@components/Header';
import { BranchMenuTab } from '@manager/menu/components/BranchMenuTab';
import { CatalogTab } from '@manager/menu/components/CatalogTab';
import { useNavigation } from '@react-navigation/native';
import React, { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabKey = 'branch' | 'catalog';

export const ManagerMenuScreen = (): JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabKey>('branch');

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <Header
        title={t('manager_menu.title')}
        onBackPress={
          navigation.canGoBack() ? (): void => navigation.goBack() : undefined
        }
      />

      <View className="flex-row border-b border-gray-200 bg-white">
        {(['branch', 'catalog'] as TabKey[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="relative flex-1 items-center py-3"
            >
              <Text
                className={`text-sm font-semibold ${active ? 'text-primary' : 'text-gray-400'}`}
              >
                {tab === 'branch'
                  ? t('manager_menu.tab_branch')
                  : t('manager_menu.tab_catalog')}
              </Text>
              {active && (
                <View className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'branch' ? <BranchMenuTab /> : <CatalogTab />}
    </SafeAreaView>
  );
};
