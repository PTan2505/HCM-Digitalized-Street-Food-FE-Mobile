import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestTaskItem } from '@features/quests/components/QuestTaskItem';
import { useQuestDetail } from '@features/quests/hooks/useQuestDetail';
import type { UserQuestTaskProgress } from '@features/quests/types/quest';
import {
  type StaticScreenProps,
  useNavigation,
} from '@react-navigation/native';

type QuestDetailScreenProps = StaticScreenProps<{
  questId: number;
}>;

export const QuestDetailScreen = ({
  route,
}: QuestDetailScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { questId } = route.params;

  const {
    quest,
    myProgress,
    loading,
    enrolling,
    stopping,
    error,
    handleEnroll,
    handleStop,
  } = useQuestDetail(questId);

  const onEnroll = async (): Promise<void> => {
    try {
      await handleEnroll();
    } catch (err) {
      Alert.alert(
        t('quest.error'),
        typeof err === 'string' ? err : t('quest.enrollError')
      );
    }
  };

  const onStop = (): void => {
    Alert.alert(t('quest.stopTitle'), t('quest.stopConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('quest.stop'),
        style: 'destructive',
        onPress: async (): Promise<void> => {
          try {
            await handleStop();
          } catch (err) {
            Alert.alert(
              t('quest.error'),
              typeof err === 'string' ? err : t('quest.stopError')
            );
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        className="flex-1 items-center justify-center bg-white"
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error || !quest) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        className="flex-1 items-center justify-center bg-white px-6"
      >
        <Text className="text-base text-gray-500">
          {error ?? t('quest.notFound')}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-full bg-primary px-6 py-2"
        >
          <Text className="text-base font-semibold text-white">
            {t('back')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Build task list: use enrolled progress if available, otherwise show quest tasks
  const taskList: UserQuestTaskProgress[] = myProgress
    ? myProgress.tasks
    : quest.tasks.map((task) => ({
        userQuestTaskId: 0,
        questTaskId: task.questTaskId,
        type: task.type,
        targetValue: task.targetValue,
        description: task.description,
        rewards: task.rewards,
        currentValue: 0,
        isCompleted: false,
        completedAt: null,
        rewardClaimed: false,
      }));

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('quest.detail')}
        onBackPress={(): void => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {quest.imageUrl ? (
          <View className="mx-4 mt-2 overflow-hidden rounded-3xl">
            <Image
              source={{ uri: quest.imageUrl }}
              className="h-56 w-full"
              resizeMode="cover"
            />

            <View className="absolute bottom-0 left-0 right-0 bg-black/45 px-4 py-3">
              <Text className="text-xl font-extrabold text-white">
                {quest.title}
              </Text>

              <View className="mt-2 flex-row items-center">
                <View className="rounded-full bg-white/20 px-2.5 py-1">
                  <Text className="text-sm font-semibold text-white">
                    {quest.taskCount} {t('quest.tasks')}
                  </Text>
                </View>

                {myProgress && (
                  <View className="ml-2 rounded-full bg-primary px-2.5 py-1">
                    <Text className="text-sm font-semibold text-white">
                      {myProgress.status === 'COMPLETED'
                        ? t('quest.completed')
                        : t('quest.inProgress')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View className="mx-4 mt-2 rounded-2xl border border-gray-100 bg-white p-4">
            <Text className="text-xl font-bold text-gray-900">
              {quest.title}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {quest.taskCount} {t('quest.tasks')}
            </Text>
          </View>
        )}

        <View className="px-4 pb-4 pt-4">
          {quest.description && (
            <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
              <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-dark">
                {t('campaign.system_detail')}
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                {quest.description}
              </Text>
            </View>
          )}

          {/* Progress summary for enrolled quests */}
          {myProgress && (
            <View className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <View className="mb-2 flex-row items-center">
                <Ionicons
                  name="trending-up-outline"
                  size={18}
                  color="#4FBE71"
                />
                <Text className="ml-2 text-base font-semibold text-gray-800">
                  {t('quest.progress')}
                </Text>
              </View>
              <View className="mb-2 h-3 overflow-hidden rounded-full bg-white">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${myProgress.totalTasks > 0 ? (myProgress.completedTasks / myProgress.totalTasks) * 100 : 0}%`,
                  }}
                />
              </View>
              <Text className="text-sm font-medium text-gray-600">
                {myProgress.completedTasks}/{myProgress.totalTasks}{' '}
                {t('quest.tasksCompleted')}
              </Text>
            </View>
          )}

          <View className="rounded-2xl border border-gray-100 bg-white p-4">
            <Text className="mb-3 text-base font-bold text-gray-900">
              {t('quest.taskList')}
            </Text>

            {taskList.map((task) => (
              <QuestTaskItem key={task.questTaskId} task={task} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Enroll button — hidden for auto-activated quests (requiresEnrollment = false) */}
      {!myProgress && quest.requiresEnrollment && (
        <View className="border-t border-gray-100 bg-white px-4 pb-8 pt-3">
          <TouchableOpacity
            onPress={onEnroll}
            disabled={enrolling}
            className="items-center rounded-full bg-primary py-3.5"
            activeOpacity={0.8}
          >
            {enrolling ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">
                {t('quest.startQuest')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Stop button — only for standalone quests in progress */}
      {quest.isStandalone && myProgress?.status === 'IN_PROGRESS' && (
        <View className="border-t border-gray-100 bg-white px-4 pb-8 pt-3">
          <TouchableOpacity
            onPress={onStop}
            disabled={stopping}
            className="items-center rounded-full border border-red-400 py-3.5"
            activeOpacity={0.8}
          >
            {stopping ? (
              <ActivityIndicator color="#f87171" />
            ) : (
              <Text className="text-base font-bold text-red-400">
                {t('quest.stop')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Continue button — standalone quest that was stopped */}
      {quest.isStandalone && myProgress?.status === 'STOPPED' && (
        <View className="border-t border-gray-100 bg-white px-4 pb-8 pt-3">
          <TouchableOpacity
            onPress={onEnroll}
            disabled={enrolling}
            className="items-center rounded-full bg-primary py-3.5"
            activeOpacity={0.8}
          >
            {enrolling ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">
                {t('quest.continue')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Auto-activated label for tier-up quests */}
      {!myProgress && !quest.requiresEnrollment && (
        <View className="border-t border-gray-100 bg-white px-4 pb-8 pt-3">
          <View className="flex-row items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 py-3.5">
            <Ionicons name="flash-outline" size={18} color="#7AB82D" />
            <Text className="text-base font-semibold text-primary-dark">
              {t('quest.autoActivated')}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
