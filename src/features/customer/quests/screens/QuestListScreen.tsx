import { COLORS } from '@constants/colors';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@components/Header';
import TabBar from '@components/TabBar';
import { QuestCard } from '@features/customer/quests/components/QuestCard';
import { useQuests } from '@features/customer/quests/hooks/useQuests';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Tab = 'discover' | 'my' | 'completed';

export const QuestListScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { publicQuests, myQuests, loading, loadPublicQuests, loadMyQuests } =
    useQuests();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [refreshing, setRefreshing] = useState(false);

  const discoverQuests = publicQuests?.items ?? [];
  const myQuestItems = myQuests?.items ?? [];
  const activeQuests = myQuestItems.filter((q) => q.status === 'IN_PROGRESS');
  const completedQuests = myQuestItems.filter((q) => q.status === 'COMPLETED');

  useEffect(() => {
    if (activeTab === 'discover') {
      loadPublicQuests(1, 10, true);
    } else {
      loadMyQuests(undefined, false);
    }
  }, [activeTab, loadPublicQuests, loadMyQuests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'discover') {
      loadPublicQuests(1, 10, true);
    } else {
      loadMyQuests(undefined, false);
    }
    setTimeout(() => setRefreshing(false), 500);
  }, [activeTab, loadPublicQuests, loadMyQuests]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'discover', label: t('quest.discover') },
    { key: 'my', label: t('quest.myQuests') },
    { key: 'completed', label: t('quest.completedQuests') },
  ];

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-100">
      <Header
        title={t('quest.title')}
        onBackPress={() => navigation.goBack()}
      />

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="equal"
        activeColor={COLORS.primaryLight}
        inactiveColor="#9CA3AF"
        indicatorColor={COLORS.primary}
      />

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : activeTab === 'discover' ? (
        <FlatList
          data={discoverQuests}
          keyExtractor={(item) => String(item.questId)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => {
            const enrolled = myQuestItems.find(
              (q) => q.questId === item.questId
            );
            return (
              <QuestCard
                quest={item}
                enrolledInfo={
                  enrolled
                    ? {
                        completedTasks: enrolled.completedTasks,
                        totalTasks: enrolled.totalTasks,
                        status: enrolled.status,
                        completedAt: enrolled.completedAt,
                      }
                    : undefined
                }
                onPress={() =>
                  navigation.navigate('QuestDetail', {
                    questId: item.questId,
                  })
                }
              />
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-base text-gray-400">
                {t('quest.noQuests')}
              </Text>
            </View>
          }
        />
      ) : activeTab === 'my' ? (
        <FlatList
          data={activeQuests}
          keyExtractor={(item) => String(item.userQuestId)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <QuestCard
              quest={{
                questId: item.questId,
                title: item.title,
                description: item.description,
                imageUrl: item.imageUrl,
                startDate: item.startedAt,
                endDate: '',
                isActive: true,
                isStandalone: item.isStandalone,
                requiresEnrollment: true,
                campaignId: item.campaignId,
                createdAt: item.startedAt,
                updatedAt: null,
                taskCount: item.totalTasks,
                tasks: [],
              }}
              enrolledInfo={{
                completedTasks: item.completedTasks,
                totalTasks: item.totalTasks,
                status: item.status,
                completedAt: item.completedAt,
              }}
              onPress={() =>
                navigation.navigate('QuestDetail', {
                  questId: item.questId,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-base text-gray-400">
                {t('quest.noMyQuests')}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={completedQuests}
          keyExtractor={(item) => String(item.userQuestId)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <QuestCard
              quest={{
                questId: item.questId,
                title: item.title,
                description: item.description,
                imageUrl: item.imageUrl,
                startDate: item.startedAt,
                endDate: '',
                isActive: true,
                isStandalone: item.isStandalone,
                requiresEnrollment: true,
                campaignId: item.campaignId,
                createdAt: item.startedAt,
                updatedAt: null,
                taskCount: item.totalTasks,
                tasks: [],
              }}
              enrolledInfo={{
                completedTasks: item.completedTasks,
                totalTasks: item.totalTasks,
                status: item.status,
                completedAt: item.completedAt,
              }}
              onPress={() =>
                navigation.navigate('QuestDetail', {
                  questId: item.questId,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-base text-gray-400">
                {t('quest.noCompletedQuests')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
