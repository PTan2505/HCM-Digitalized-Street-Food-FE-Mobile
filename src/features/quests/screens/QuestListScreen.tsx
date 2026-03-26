import { Ionicons } from '@expo/vector-icons';
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

import { QuestCard } from '@features/quests/components/QuestCard';
import { useQuests } from '@features/quests/hooks/useQuests';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Tab = 'discover' | 'my';

export const QuestListScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { publicQuests, myQuests, loading, loadPublicQuests, loadMyQuests } =
    useQuests();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'discover') {
      loadPublicQuests();
    } else {
      loadMyQuests();
    }
    setTimeout(() => setRefreshing(false), 500);
  }, [activeTab, loadPublicQuests, loadMyQuests]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pb-2 pt-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-gray-900">
          {t('quest.title')}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 px-4">
        <TouchableOpacity
          onPress={() => setActiveTab('discover')}
          className={`mr-6 pb-3 ${activeTab === 'discover' ? 'border-b-2 border-[#a1d973]' : ''}`}
        >
          <Text
            className={`text-sm font-semibold ${activeTab === 'discover' ? 'text-[#7AB82D]' : 'text-gray-400'}`}
          >
            {t('quest.discover')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('my')}
          className={`pb-3 ${activeTab === 'my' ? 'border-b-2 border-[#a1d973]' : ''}`}
        >
          <Text
            className={`text-sm font-semibold ${activeTab === 'my' ? 'text-[#7AB82D]' : 'text-gray-400'}`}
          >
            {t('quest.myQuests')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : activeTab === 'discover' ? (
        <FlatList
          data={publicQuests?.items ?? []}
          keyExtractor={(item) => String(item.questId)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#a1d973']}
              tintColor="#a1d973"
            />
          }
          renderItem={({ item }) => {
            const enrolled = myQuests.find((q) => q.questId === item.questId);
            return (
              <QuestCard
                quest={item}
                enrolledInfo={
                  enrolled
                    ? {
                        completedTasks: enrolled.completedTasks,
                        totalTasks: enrolled.totalTasks,
                        status: enrolled.status,
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
      ) : (
        <FlatList
          data={myQuests}
          keyExtractor={(item) => String(item.userQuestId)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#a1d973']}
              tintColor="#a1d973"
            />
          }
          renderItem={({ item }) => (
            <QuestCard
              quest={{
                questId: item.questId,
                title: item.title,
                description: item.description,
                imageUrl: item.imageUrl,
                startDate: item.startDate,
                endDate: item.endDate,
                isActive: true,
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
      )}
    </SafeAreaView>
  );
};
