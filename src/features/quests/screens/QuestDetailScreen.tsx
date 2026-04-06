import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@constants/colors';
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

  const { quest, myProgress, loading, enrolling, error, handleEnroll } =
    useQuestDetail(questId);

  const onEnroll = async (): Promise<void> => {
    try {
      await handleEnroll();
    } catch {
      Alert.alert(t('quest.error'), t('quest.enrollError'));
    }
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
          <Text className="text-sm font-semibold text-white">{t('back')}</Text>
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
        rewardType: task.rewardType,
        rewardValue: task.rewardValue,
        currentValue: 0,
        isCompleted: false,
        completedAt: null,
        rewardClaimed: false,
      }));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        {quest.imageUrl ? (
          <View>
            <Image
              source={{ uri: quest.imageUrl }}
              className="h-52 w-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="absolute left-4 top-3 h-9 w-9 items-center justify-center rounded-full bg-black/30"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center px-4 pb-2 pt-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="flex-1 text-xl font-bold text-gray-900">
              {t('quest.detail')}
            </Text>
          </View>
        )}

        <View className="p-4">
          {/* Title & meta */}
          <Text className="mb-1 text-xl font-bold text-gray-900">
            {quest.title}
          </Text>

          <View className="mb-3 flex-row items-center">
            <Text className="text-sm text-gray-400">
              {quest.taskCount} {t('quest.tasks')}
            </Text>
            {myProgress && (
              <View className="ml-3 rounded-full bg-primary/20 px-3 py-0.5">
                <Text className="text-xs font-semibold text-primary-light">
                  {myProgress.status === 'COMPLETED'
                    ? t('quest.completed')
                    : t('quest.inProgress')}
                </Text>
              </View>
            )}
          </View>

          {quest.description && (
            <Text className="mb-4 text-sm leading-5 text-gray-600">
              {quest.description}
            </Text>
          )}

          {/* Progress summary for enrolled quests */}
          {myProgress && (
            <View className="mb-4 rounded-xl bg-primary/10 p-4">
              <Text className="mb-2 text-sm font-semibold text-gray-800">
                {t('quest.progress')}
              </Text>
              <View className="mb-1 h-3 overflow-hidden rounded-full bg-gray-200">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${myProgress.totalTasks > 0 ? (myProgress.completedTasks / myProgress.totalTasks) * 100 : 0}%`,
                  }}
                />
              </View>
              <Text className="text-xs text-gray-500">
                {myProgress.completedTasks}/{myProgress.totalTasks}{' '}
                {t('quest.tasksCompleted')}
              </Text>
            </View>
          )}

          {/* Tasks */}
          <Text className="mb-3 text-base font-bold text-gray-900">
            {t('quest.taskList')}
          </Text>

          {taskList.map((task) => (
            <QuestTaskItem key={task.questTaskId} task={task} />
          ))}
        </View>
      </ScrollView>

      {/* Enroll button (only show if not enrolled) */}
      {!myProgress && (
        <View className="border-t border-gray-100 px-4 pb-8 pt-3">
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
    </SafeAreaView>
  );
};
