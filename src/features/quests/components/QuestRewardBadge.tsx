import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { QuestRewardType } from '@features/quests/types/quest';
import { axiosApi } from '@lib/api/apiInstance';

// Backend may return the enum as an integer (BADGE=1, POINTS=2, VOUCHER=3)
const NUMERIC_REWARD_MAP: Record<number, QuestRewardType> = {
  1: 'BADGE',
  2: 'POINTS',
  3: 'VOUCHER',
};

function normalizeRewardType(value: QuestRewardType | number): QuestRewardType {
  if (typeof value === 'number') return NUMERIC_REWARD_MAP[value] ?? 'POINTS';
  return value;
}

const REWARD_CONFIG: Record<
  QuestRewardType,
  {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    bg: string;
    text: string;
    iconColor: string;
  }
> = {
  POINTS: {
    icon: 'star',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    iconColor: '#CA8A04',
  },
  BADGE: {
    icon: 'medal',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    iconColor: '#7C3AED',
  },
  VOUCHER: {
    icon: 'pricetag',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    iconColor: '#C2410C',
  },
};

const CLAIMED_CONFIG = {
  bg: 'bg-green-100',
  text: 'text-green-700',
  iconColor: '#15803D',
};

interface QuestRewardBadgeProps {
  rewardType: QuestRewardType | number;
  rewardValue: number;
  claimed?: boolean;
}

export const QuestRewardBadge = ({
  rewardType,
  rewardValue,
  claimed = false,
}: QuestRewardBadgeProps): JSX.Element => {
  const { t } = useTranslation();
  const normalized = normalizeRewardType(rewardType);
  const config = REWARD_CONFIG[normalized];

  const bg = claimed ? CLAIMED_CONFIG.bg : config.bg;
  const textColor = claimed ? CLAIMED_CONFIG.text : config.text;
  const iconColor = claimed ? CLAIMED_CONFIG.iconColor : config.iconColor;
  const icon: React.ComponentProps<typeof Ionicons>['name'] = claimed
    ? 'checkmark-circle'
    : config.icon;

  const [badgeName, setBadgeName] = useState<string | null>(null);
  const [voucherDisplay, setVoucherDisplay] = useState<{
    name: string;
    discount: string;
    remain: string;
  } | null>(null);

  useEffect(() => {
    if (normalized === 'BADGE') {
      axiosApi.questApi
        .getBadgeById(rewardValue)
        .then((b) => setBadgeName(b.badgeName))
        .catch(() => {});
    }
    if (normalized === 'VOUCHER') {
      axiosApi.questApi
        .getVoucherById(rewardValue)
        .then((v) => {
          const isPercent = v.type.toUpperCase().includes('PERCENT');
          const discount = isPercent
            ? `${t('quest.reward.voucherOff')} ${v.discountValue}%`
            : `${t('quest.reward.voucherOff')} ${v.discountValue.toLocaleString()}đ`;
          const remain = t('quest.reward.voucherRemain', { count: v.remain });
          setVoucherDisplay({ name: v.name, discount, remain });
        })
        .catch(() => {});
    }
  }, [normalized, rewardValue, t]);

  const getLabel = (): string => {
    if (normalized === 'POINTS')
      return `+${rewardValue} ${t('quest.reward.points')}`;
    if (normalized === 'BADGE') return badgeName ?? t('quest.reward.badge');
    return t('quest.reward.voucher');
  };

  return (
    <View className={`items-end rounded-xl px-2.5 py-1.5 ${bg}`}>
      <View className="flex-row items-center gap-x-1">
        <Ionicons name={icon} size={13} color={iconColor} />
        <Text className={`text-sm font-bold ${textColor}`}>
          {normalized === 'VOUCHER' && voucherDisplay
            ? voucherDisplay.name
            : getLabel()}
        </Text>
      </View>
      {normalized === 'VOUCHER' && voucherDisplay && (
        <>
          <Text className={`mt-0.5 text-sm font-semibold ${textColor}`}>
            {voucherDisplay.discount}
          </Text>
          <Text className={`text-[10px] opacity-70 ${textColor}`}>
            {voucherDisplay.remain}
          </Text>
        </>
      )}
    </View>
  );
};
