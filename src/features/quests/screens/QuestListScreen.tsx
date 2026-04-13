import { COLORS } from '@constants/colors';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@components/Header';
import { QuestCard } from '@features/quests/components/QuestCard';
import { useQuests } from '@features/quests/hooks/useQuests';
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
  const [tabWidth, setTabWidth] = useState(0);

  const tabKeys: Tab[] = ['discover', 'my', 'completed'];
  const indicatorX = useSharedValue(0);
  const tab0Active = useSharedValue(1);
  const tab1Active = useSharedValue(0);
  const tab2Active = useSharedValue(0);
  const tabActives = [tab0Active, tab1Active, tab2Active];

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const tab0TextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      tab0Active.value,
      [0, 1],
      ['#9CA3AF', COLORS.primaryLight]
    ),
  }));
  const tab1TextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      tab1Active.value,
      [0, 1],
      ['#9CA3AF', COLORS.primaryLight]
    ),
  }));
  const tab2TextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      tab2Active.value,
      [0, 1],
      ['#9CA3AF', COLORS.primaryLight]
    ),
  }));
  const tabTextStyles = [tab0TextStyle, tab1TextStyle, tab2TextStyle];

  const handleTabChange = useCallback(
    (key: Tab) => {
      const newIdx = tabKeys.indexOf(key);
      indicatorX.value = withTiming(newIdx * tabWidth, { duration: 250 });
      tabActives.forEach((v, i) => {
        v.value = withTiming(i === newIdx ? 1 : 0, { duration: 250 });
      });
      setActiveTab(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabWidth]
  );

  useEffect(() => {
    if (tabWidth > 0) {
      indicatorX.value = tabKeys.indexOf(activeTab) * tabWidth;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabWidth]);

  const activeQuests = myQuests.filter(
    (q) => q.status === 'IN_PROGRESS' || q.status === 'STOPPED'
  );
  const completedQuests = myQuests.filter((q) => q.status === 'COMPLETED');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'discover') {
      loadPublicQuests();
    } else {
      loadMyQuests();
    }
    setTimeout(() => setRefreshing(false), 500);
  }, [activeTab, loadPublicQuests, loadMyQuests]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'discover', label: t('quest.discover') },
    { key: 'my', label: t('quest.myQuests') },
    { key: 'completed', label: t('quest.completedQuests') },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('quest.title')}
        onBackPress={() => navigation.goBack()}
      />

      {/* Tabs */}
      <View className="border-b border-gray-200 px-4">
        <View
          className="flex-row"
          onLayout={(e) =>
            setTabWidth(e.nativeEvent.layout.width / tabs.length)
          }
        >
          {tabs.map((tab, i) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabChange(tab.key)}
              className="flex-1 items-center pb-3"
            >
              <Animated.Text
                className="text-base font-semibold"
                style={tabTextStyles[i]}
              >
                {tab.label}
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View
          style={[
            {
              width: tabWidth,
              height: 2,
              backgroundColor: COLORS.primary,
              marginTop: -2,
            },
            indicatorStyle,
          ]}
        />
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
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
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
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
