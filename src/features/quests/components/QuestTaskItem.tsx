import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { QuestRewardBadge } from '@features/quests/components/QuestRewardBadge';
import type {
  QuestTaskType,
  UserQuestTaskProgress,
} from '@features/quests/types/quest';

interface QuestTaskItemProps {
  task: UserQuestTaskProgress;
  onClaimReward?: (task: UserQuestTaskProgress) => void;
}

const TASK_TYPE_ICONS: Record<
  QuestTaskType,
  {
    name: ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    backgroundColor: string;
  }
> = {
  REVIEW: {
    name: 'create-outline',
    iconColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  ORDER_AMOUNT: {
    name: 'cash-outline',
    iconColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  SHARE: {
    name: 'share-social-outline',
    iconColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  CREATE_GHOST_PIN: {
    name: 'location-outline',
    iconColor: '#EA580C',
    backgroundColor: '#FFEDD5',
  },
};

// Backend may return task type as an integer (REVIEW=1, ORDER_AMOUNT=2, SHARE=3, CREATE_GHOST_PIN=4)
const NUMERIC_TASK_MAP: Record<number, QuestTaskType> = {
  1: 'REVIEW',
  2: 'ORDER_AMOUNT',
  3: 'SHARE',
  4: 'CREATE_GHOST_PIN',
};

function normalizeTaskType(value: QuestTaskType | number): QuestTaskType {
  if (typeof value === 'number') return NUMERIC_TASK_MAP[value] ?? 'REVIEW';
  return value;
}

export const QuestTaskItem = ({ task }: QuestTaskItemProps): JSX.Element => {
  const { t } = useTranslation();
  const taskType = normalizeTaskType(task.type);
  const taskIcon = TASK_TYPE_ICONS[taskType];
  const progress = Math.min(
    Math.round((task.currentValue / task.targetValue) * 100),
    100
  );

  const getTaskLabel = (): string => {
    switch (taskType) {
      case 'REVIEW':
        return t('quest.taskType.review');
      case 'ORDER_AMOUNT':
        return t('quest.taskType.orderAmount');
      case 'SHARE':
        return t('quest.taskType.share');
      case 'CREATE_GHOST_PIN':
        return t('quest.taskType.createGhostPin');
      default:
        return task.type;
    }
  };

  return (
    <View className="mb-3 rounded-xl bg-gray-50 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View
            className="mr-2 rounded-lg p-2"
            style={{ backgroundColor: taskIcon.backgroundColor }}
          >
            <Ionicons
              name={taskIcon.name}
              size={16}
              color={taskIcon.iconColor}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">
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
          className={`h-full rounded-full ${task.isCompleted ? 'bg-green-500' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-gray-400">
          {taskType === 'ORDER_AMOUNT'
            ? `${task.currentValue.toLocaleString()}/${task.targetValue.toLocaleString()} VND`
            : `${task.currentValue}/${task.targetValue}`}
        </Text>
        {task.isCompleted && (
          <Text className="text-sm font-semibold text-green-600">
            {t('quest.completed')}
          </Text>
        )}
      </View>
    </View>
  );
};
