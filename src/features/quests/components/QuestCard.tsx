import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import type { QuestResponse } from '@features/quests/types/quest';

interface QuestCardProps {
  quest: QuestResponse;
  enrolledInfo?: {
    completedTasks: number;
    totalTasks: number;
    status: string;
    completedAt?: string | null;
  };
  onPress: () => void;
}

export const QuestCard = ({
  quest,
  enrolledInfo,
  onPress,
}: QuestCardProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="mb-4 overflow-hidden rounded-2xl bg-gray-100 shadow-sm"
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
          <Text className="mb-2 text-base text-gray-500" numberOfLines={2}>
            {quest.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-400">
            {quest.taskCount} {t('quest.tasks')}
          </Text>

          {enrolledInfo ? (
            enrolledInfo.status === 'COMPLETED' ? (
              <View className="rounded-full bg-green-100 px-3 py-1">
                <Text className="text-sm font-semibold text-green-700">
                  {t('quest.completed')}
                  {enrolledInfo.completedAt
                    ? `  ${new Date(enrolledInfo.completedAt).toLocaleDateString('vi-VN')}`
                    : ''}
                </Text>
              </View>
            ) : (
              <View className="rounded-full bg-primary/20 px-3 py-1">
                <Text className="text-sm font-semibold text-primary-light">
                  {enrolledInfo.completedTasks}/{enrolledInfo.totalTasks}{' '}
                  {t('quest.tasksCompleted')}
                </Text>
              </View>
            )
          ) : (
            <View className="rounded-full bg-primary px-3 py-1">
              <Text className="text-sm font-semibold text-white">
                {t('quest.startQuest')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
