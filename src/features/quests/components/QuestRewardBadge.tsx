import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { QuestRewardType } from '@features/quests/types/quest';

interface QuestRewardBadgeProps {
  rewardType: QuestRewardType;
  rewardValue: number;
  claimed?: boolean;
}

export const QuestRewardBadge = ({
  rewardType,
  rewardValue,
  claimed = false,
}: QuestRewardBadgeProps): JSX.Element => {
  const { t } = useTranslation();

  const getLabel = (): string => {
    switch (rewardType) {
      case 'BADGE':
        return t('quest.reward.badge');
      case 'POINTS':
        return `+${rewardValue} ${t('quest.reward.points')}`;
      case 'VOUCHER':
        return t('quest.reward.voucher');
      default:
        return '';
    }
  };

  const getIcon = (): string => {
    switch (rewardType) {
      case 'BADGE':
        return '🏅';
      case 'POINTS':
        return '⭐';
      case 'VOUCHER':
        return '🎟️';
      default:
        return '';
    }
  };

  return (
    <View
      className={`flex-row items-center rounded-full px-3 py-1 ${
        claimed ? 'bg-green-100' : 'bg-gray-100'
      }`}
    >
      <Text className="mr-1 text-sm">{getIcon()}</Text>
      <Text
        className={`text-xs font-semibold ${
          claimed ? 'text-green-700' : 'text-gray-600'
        }`}
      >
        {getLabel()}
        {claimed ? ` ✓` : ''}
      </Text>
    </View>
  );
};
