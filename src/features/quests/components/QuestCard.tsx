import type { JSX } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { QuestResponse } from '@features/quests/types/quest';

interface QuestCardProps {
  quest: QuestResponse;
  enrolledInfo?: {
    completedTasks: number;
    totalTasks: number;
    status: string;
  };
  onPress: () => void;
}

export const QuestCard = ({
  quest,
  enrolledInfo,
  onPress,
}: QuestCardProps): JSX.Element => {
  const { t } = useTranslation();

  const endDate = new Date(quest.endDate);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <TouchableOpacity
      className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {quest.imageUrl && (
        <Image
          source={{ uri: quest.imageUrl }}
          className="h-36 w-full"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        <Text className="mb-1 text-base font-bold text-gray-900">
          {quest.title}
        </Text>

        {quest.description && (
          <Text className="mb-2 text-sm text-gray-500" numberOfLines={2}>
            {quest.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-400">
            {quest.taskCount} {t('quest.tasks')} · {daysLeft}{' '}
            {t('quest.daysLeft')}
          </Text>

          {enrolledInfo ? (
            <View className="rounded-full bg-[#a1d973]/20 px-3 py-1">
              <Text className="text-xs font-semibold text-[#7AB82D]">
                {enrolledInfo.completedTasks}/{enrolledInfo.totalTasks}{' '}
                {t('quest.tasksCompleted')}
              </Text>
            </View>
          ) : (
            <View className="rounded-full bg-[#a1d973] px-3 py-1">
              <Text className="text-xs font-semibold text-white">
                {t('quest.startQuest')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
