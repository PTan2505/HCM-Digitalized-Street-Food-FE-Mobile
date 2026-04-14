import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { axiosApi } from '@lib/api/apiInstance';

import type {
  QuestResponse,
  QuestRewardType,
} from '@features/quests/types/quest';

const NUMERIC_REWARD_MAP: Record<number, QuestRewardType> = {
  1: 'BADGE',
  2: 'POINTS',
  3: 'VOUCHER',
};

const normalizeRewardType = (
  value: QuestRewardType | number
): QuestRewardType => {
  if (typeof value === 'number') return NUMERIC_REWARD_MAP[value] ?? 'POINTS';
  return value;
};

const campaignNameCache = new Map<number, string>();

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
  const [campaignName, setCampaignName] = useState<string | null>(null);

  useEffect((): void | (() => void) => {
    const campaignId = quest.campaignId;

    if (!campaignId) {
      setCampaignName(null);
      return;
    }

    const cached = campaignNameCache.get(campaignId);
    if (cached) {
      setCampaignName(cached);
      return;
    }

    let mounted = true;

    axiosApi.questApi
      .getCampaignById(campaignId)
      .then((campaign) => {
        if (!mounted || !campaign?.name) return;
        campaignNameCache.set(campaignId, campaign.name);
        setCampaignName(campaign.name);
      })
      .catch(() => {
        if (mounted) setCampaignName(null);
      });

    return (): void => {
      mounted = false;
    };
  }, [quest.campaignId]);

  const progress = enrolledInfo
    ? Math.min(
        Math.round(
          (enrolledInfo.completedTasks / enrolledInfo.totalTasks) * 100
        ),
        100
      )
    : 0;

  // Aggregate all rewards across all tasks into a summary map
  const rewardMap = new Map<
    string,
    { type: QuestRewardType; rewardValue: number; totalQty: number }
  >();

  quest.tasks.forEach((task) => {
    task.rewards.forEach((r) => {
      const type = normalizeRewardType(
        r.rewardType as QuestRewardType | number
      );
      const key = `${type}-${r.rewardValue}`;
      const existing = rewardMap.get(key);
      if (existing) {
        rewardMap.set(key, {
          ...existing,
          totalQty: existing.totalQty + r.quantity,
        });
      } else {
        rewardMap.set(key, {
          type,
          rewardValue: r.rewardValue,
          totalQty: r.quantity,
        });
      }
    });
  });

  const rewards = Array.from(rewardMap.values());

  const formatRewardText = (
    type: QuestRewardType,
    rewardValue: number,
    totalQty: number
  ): string => {
    let label = '';

    if (type === 'POINTS') {
      label = `+${rewardValue} ${t('quest.reward.points')}`;
    } else if (type === 'BADGE') {
      label = t('quest.reward.badge');
    } else {
      label = t('quest.reward.voucher');
    }

    return totalQty > 1 ? `${label} x${totalQty}` : label;
  };

  return (
    <TouchableOpacity
      className="mb-4 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-md"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="relative">
        {quest.imageUrl ? (
          <Image
            source={{ uri: quest.imageUrl }}
            className="h-40 w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-40 w-full items-center justify-center bg-lime-100">
            <Ionicons name="document-text-outline" size={34} color="#4D7C0F" />
            <Text className="mt-2 text-sm font-semibold text-lime-800">
              {t('quest.title')}
            </Text>
          </View>
        )}

        <View className="absolute right-3 top-3 flex-row items-center gap-2">
          {!quest.requiresEnrollment && (
            <View className="flex-row items-center rounded-full bg-primary/90 px-2.5 py-1">
              <Ionicons name="flash-outline" size={12} color="#FFFFFF" />
              <Text className="ml-1 text-xs font-bold text-white">
                {t('quest.auto')}
              </Text>
            </View>
          )}
          <View className="flex-row items-center rounded-full bg-black/60 px-3 py-1">
            <Ionicons name="list-outline" size={14} color="#FFFFFF" />
            <Text className="ml-1 text-xs font-semibold text-white">
              {quest.taskCount} {t('quest.tasks')}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="mb-1 text-lg font-bold text-gray-900">
          {quest.title}
        </Text>

        {!!quest.campaignId && !!campaignName && (
          <View className="mb-2 self-start rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1">
            <Text className="text-xs font-semibold text-blue-700">
              {t('campaign.title')}: {campaignName}
            </Text>
          </View>
        )}

        {quest.description && (
          <Text
            className="mb-3 text-sm leading-5 text-gray-500"
            numberOfLines={2}
          >
            {quest.description}
          </Text>
        )}

        {rewards.length > 0 && (
          <View className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2">
            <View className="mb-2 flex-row items-center">
              <Ionicons name="gift-outline" size={14} color="#B45309" />
              <Text className="ml-1 text-xs font-semibold text-amber-700">
                {t('quest.rewards')}
              </Text>
            </View>

            <View className="flex-row flex-wrap">
              {rewards.map((reward) => {
                const iconName =
                  reward.type === 'POINTS'
                    ? 'star-outline'
                    : reward.type === 'BADGE'
                      ? 'medal-outline'
                      : 'pricetag-outline';

                const chipClass =
                  reward.type === 'POINTS'
                    ? 'border-yellow-200 bg-yellow-100'
                    : reward.type === 'BADGE'
                      ? 'border-indigo-200 bg-indigo-100'
                      : 'border-orange-200 bg-orange-100';

                const textClass =
                  reward.type === 'POINTS'
                    ? 'text-yellow-800'
                    : reward.type === 'BADGE'
                      ? 'text-indigo-800'
                      : 'text-orange-800';

                return (
                  <View
                    key={`${reward.type}-${reward.rewardValue}`}
                    className={`mb-2 mr-2 flex-row items-center rounded-full border px-2.5 py-1 ${chipClass}`}
                  >
                    <Ionicons name={iconName} size={12} color="#1F2937" />
                    <Text className={`ml-1 text-xs font-semibold ${textClass}`}>
                      {formatRewardText(
                        reward.type,
                        reward.rewardValue,
                        reward.totalQty
                      )}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {enrolledInfo &&
          (enrolledInfo.status === 'COMPLETED' ? (
            <View className="rounded-2xl border border-green-200 bg-green-50 px-3 py-2">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                <Text className="ml-1 text-sm font-semibold text-green-700">
                  {t('quest.completed')}
                </Text>
              </View>
              {enrolledInfo.completedAt && (
                <Text className="mt-1 text-xs text-green-700/90">
                  {new Date(enrolledInfo.completedAt).toLocaleDateString(
                    'vi-VN'
                  )}
                </Text>
              )}
            </View>
          ) : enrolledInfo.status === 'IN_PROGRESS' ? (
            <View className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-primary-dark">
                  {enrolledInfo.completedTasks}/{enrolledInfo.totalTasks}{' '}
                  {t('quest.tasksCompleted')}
                </Text>
                <Text className="text-xs font-bold text-primary-dark">
                  {progress}%
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-primary/20">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          ) : (
            <View className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2">
              <View className="flex-row items-center">
                <Ionicons name="stop-circle" size={16} color="#b91c1c" />
                <Text className="ml-1 text-sm font-semibold text-red-700">
                  {t('quest.stopped')}
                </Text>
              </View>
            </View>
          ))}
      </View>
    </TouchableOpacity>
  );
};
