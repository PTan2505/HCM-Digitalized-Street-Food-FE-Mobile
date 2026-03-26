import { CampaignCard } from '@features/campaigns/components/CampaignCard';
import { CampaignTypeTabs } from '@features/campaigns/components/CampaignTypeTabs';
import { NearbyCampaignsSection } from '@features/campaigns/components/NearbyCampaignsSection';
import { useNearbyCampaigns } from '@features/campaigns/hooks/useNearbyCampaigns';
import { useRestaurantCampaigns } from '@features/campaigns/hooks/useRestaurantCampaigns';
import { useSystemCampaigns } from '@features/campaigns/hooks/useSystemCampaigns';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@lib/queryKeys';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
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

type TabKey = 'system' | 'restaurant';

export const CampaignListScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const [activeTab, setActiveTab] = useState<TabKey>('system');
  const [refreshing, setRefreshing] = useState(false);
  const { coords } = useLocationPermission();
  const queryClient = useQueryClient();

  const {
    systemCampaigns,
    isLoading: systemLoading,
    isError: systemError,
  } = useSystemCampaigns();
  const {
    restaurantCampaigns,
    isLoading: restaurantLoading,
    isError: restaurantError,
  } = useRestaurantCampaigns(coords);
  useNearbyCampaigns(coords);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    setRefreshing(false);
  }, [queryClient]);

  const isLoading = systemLoading || restaurantLoading;
  const error = systemError || restaurantError;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="px-4 pb-2 pt-4">
        <Text className="text-2xl font-bold text-gray-900">
          {t('campaign.title')}
        </Text>
      </View>

      <CampaignTypeTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-gray-500">
            {t('campaign.error')}
          </Text>
          <TouchableOpacity
            onPress={() => void onRefresh()}
            className="mt-4 rounded-full bg-[#a1d973] px-6 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              {t('campaign.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'system' ? (
        <FlatList
          data={systemCampaigns}
          keyExtractor={(item) => String(item.campaignId)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              colors={['#a1d973']}
              tintColor="#a1d973"
            />
          }
          ListHeaderComponent={<NearbyCampaignsSection />}
          renderItem={({ item }) => (
            <CampaignCard
              campaign={item}
              type="system"
              onPress={() =>
                navigation.navigate('SystemCampaignDetail', {
                  campaignId: String(item.campaignId),
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-center text-base text-gray-400">
                {t('campaign.empty')}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={restaurantCampaigns}
          keyExtractor={(item) => String(item.campaignId)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              colors={['#a1d973']}
              tintColor="#a1d973"
            />
          }
          renderItem={({ item }) => (
            <CampaignCard
              campaign={item}
              type="restaurant"
              onPress={() =>
                navigation.navigate('RestaurantCampaignDetail', {
                  campaignId: String(item.campaignId),
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-center text-base text-gray-400">
                {t('campaign.empty')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
