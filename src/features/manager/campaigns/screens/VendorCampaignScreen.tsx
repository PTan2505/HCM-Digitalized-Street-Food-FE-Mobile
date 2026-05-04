import Header from '@components/Header';
import TabBar from '@components/TabBar';
import { CampaignCard } from '@manager/campaigns/components/CampaignCard';
import { CampaignStatusBadge } from '@manager/campaigns/components/CampaignStatusBadge';
import { useVendorCampaignsList } from '@manager/campaigns/hooks/useVendorCampaigns';
import { useSystemCampaigns } from '@manager/campaigns/hooks/useSystemCampaigns';
import type { SystemCampaign } from '@manager/campaigns/api/managerCampaignApi';
import { useNavigation } from '@react-navigation/native';
import React, { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = [
  { key: 'my', labelKey: 'manager_campaigns.tab_my' },
  { key: 'system', labelKey: 'manager_campaigns.tab_system' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const SystemCampaignItem = ({
  item,
  onPress,
}: {
  item: SystemCampaign;
  onPress: () => void;
}): JSX.Element => {
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
          {item.name}
        </Text>
        <CampaignStatusBadge
          isActive={item.isActive}
          isRegisterable={item.isRegisterable}
          startDate={item.startDate}
          endDate={item.endDate}
          registrationStartDate={item.registrationStartDate}
          registrationEndDate={item.registrationEndDate}
        />
      </View>
      {item.description ? (
        <Text className="mb-2 text-xs text-gray-500" numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      <Text className="text-xs text-gray-400">
        {t('manager_campaigns.active_period')}: {formatDate(item.startDate)} →{' '}
        {formatDate(item.endDate)}
      </Text>
    </TouchableOpacity>
  );
};

export const VendorCampaignScreen = (): JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabKey>('my');

  const {
    items: myCampaigns,
    isLoading: myLoading,
    isRefreshing: myRefreshing,
    isLoadingMore: myLoadingMore,
    hasNext: myHasNext,
    loadMore: myLoadMore,
    refresh: myRefresh,
  } = useVendorCampaignsList();

  const {
    data: systemCampaignsData,
    isLoading: systemLoading,
    isRefetching: systemRefetching,
    refetch: systemRefetch,
  } = useSystemCampaigns();
  const systemCampaigns = systemCampaignsData?.items ?? [];

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('manager_campaigns.title')}
        secondaryAction={
          activeTab === 'my'
            ? {
                label: t('manager_campaigns.create_button'),
                onPress: () => navigation.navigate('VendorCreateCampaign'),
              }
            : undefined
        }
      />
      <TabBar
        tabs={TABS.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="equal"
      />

      {activeTab === 'my' ? (
        myLoading && myCampaigns.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#9FD356" />
          </View>
        ) : (
          <FlatList
            data={myCampaigns}
            keyExtractor={(item) => String(item.campaignId)}
            renderItem={({ item }) => (
              <CampaignCard
                campaign={item}
                onPress={() =>
                  navigation.navigate('VendorCampaignDetail', {
                    campaignId: item.campaignId,
                  })
                }
              />
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-16">
                <Text className="text-base text-gray-400">
                  {t('manager_campaigns.empty')}
                </Text>
                <TouchableOpacity
                  className="mt-4 rounded-full bg-primary px-6 py-2"
                  onPress={() => navigation.navigate('VendorCreateCampaign')}
                >
                  <Text className="font-semibold text-white">
                    {t('manager_campaigns.create_button')}
                  </Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={
              myLoadingMore ? (
                <ActivityIndicator
                  size="small"
                  color="#9FD356"
                  className="py-4"
                />
              ) : null
            }
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 32,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={myRefreshing}
                onRefresh={myRefresh}
                tintColor="#9FD356"
              />
            }
            onEndReached={myHasNext ? (): void => myLoadMore() : undefined}
            onEndReachedThreshold={0.3}
          />
        )
      ) : systemLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : (
        <FlatList
          data={systemCampaigns}
          keyExtractor={(item) => String(item.campaignId)}
          renderItem={({ item }) => (
            <SystemCampaignItem
              item={item}
              onPress={() =>
                navigation.navigate('VendorSystemCampaignDetail', {
                  campaignId: item.campaignId,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-16">
              <Text className="text-base text-gray-400">
                {t('manager_campaigns.system_empty')}
              </Text>
            </View>
          }
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={systemRefetching}
              onRefresh={() => void systemRefetch()}
              tintColor="#9FD356"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};
