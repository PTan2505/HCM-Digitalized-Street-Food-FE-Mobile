import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { QuestRewardBadge } from '@features/quests/components/QuestRewardBadge';
import type {
  QuestTaskType,
  UserQuestTaskProgress,
} from '@features/quests/types/quest';

interface QuestTaskItemProps {
  task: UserQuestTaskProgress;
}

const TASK_TYPE_ICONS: Record<QuestTaskType, string> = {
  REVIEW: '📝',
  ORDER_AMOUNT: '💰',
  VISIT: '📍',
  SHARE: '🔗',
};

export const QuestTaskItem = ({ task }: QuestTaskItemProps): JSX.Element => {
  const { t } = useTranslation();
  const progress = Math.min(
    Math.round((task.currentValue / task.targetValue) * 100),
    100
  );

  const getTaskLabel = (): string => {
    switch (task.type) {
      case 'REVIEW':
        return t('quest.taskType.review');
      case 'ORDER_AMOUNT':
        return t('quest.taskType.orderAmount');
      case 'VISIT':
        return t('quest.taskType.visit');
      case 'SHARE':
        return t('quest.taskType.share');
      default:
        return task.type;
    }
  };

  return (
    <View className="mb-3 rounded-xl bg-gray-50 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Text className="mr-2 text-lg">{TASK_TYPE_ICONS[task.type]}</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-800">
              {task.description ?? getTaskLabel()}
            </Text>
          </View>
        </View>
        <QuestRewardBadge
          rewardType={task.rewardType}
          rewardValue={task.rewardValue}
          claimed={task.rewardClaimed}
        />
      </View>

      <View className="mb-1 h-2.5 overflow-hidden rounded-full bg-gray-200">
        <View
          className={`h-full rounded-full ${task.isCompleted ? 'bg-green-500' : 'bg-[#a1d973]'}`}
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-400">
          {task.type === 'ORDER_AMOUNT'
            ? `${task.currentValue.toLocaleString()}/${task.targetValue.toLocaleString()} VND`
            : `${task.currentValue}/${task.targetValue}`}
        </Text>
        {task.isCompleted && (
          <Text className="text-xs font-semibold text-green-600">
            {t('quest.completed')}
          </Text>
        )}
      </View>
    </View>
  );
};
