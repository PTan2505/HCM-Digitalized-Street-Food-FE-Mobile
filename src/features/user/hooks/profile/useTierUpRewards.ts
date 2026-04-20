import type { QuestTaskRewardItem } from '@features/quests/types/quest';
import { axiosApi } from '@lib/api/apiInstance';
import { useEffect, useState } from 'react';

// The backend serializes QuestTaskType as its integer value (no JsonStringEnumConverter).
// TIER_UP = 5 in the C# enum.
const TIER_UP_NUMERIC = 5;

/**
 * Fetches all public tier-up quests and organises their rewards by tierId.
 * Only TIER_UP tasks are used; tierId = task.targetValue.
 *
 * Returns rewardsByTierId: { [tierId]: QuestTaskRewardItem[] }
 * Silver (tierId=2) is the starting tier and will never have rewards.
 */
export const useTierUpRewards = (): {
  rewardsByTierId: Record<number, QuestTaskRewardItem[]>;
  loading: boolean;
} => {
  const [rewardsByTierId, setRewardsByTierId] = useState<
    Record<number, QuestTaskRewardItem[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async (): Promise<void> => {
      try {
        const result = await axiosApi.questApi.getPublicQuests(
          1,
          50,
          undefined,
          true
        );

        if (cancelled) return;

        const map: Record<number, QuestTaskRewardItem[]> = {};

        for (const quest of result.items) {
          for (const task of quest.tasks) {
            // Guard against both string ("TIER_UP") and numeric (5) serialization
            const taskType = task.type as string | number;
            if (taskType !== 'TIER_UP' && taskType !== TIER_UP_NUMERIC)
              continue;

            const tierId = task.targetValue;
            if (!map[tierId]) map[tierId] = [];
            map[tierId].push(...task.rewards);
          }
        }

        setRewardsByTierId(map);
      } catch {
        // Leave rewardsByTierId empty on error — rewards section simply won't render
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetch();
    return (): void => {
      cancelled = true;
    };
  }, []);

  return { rewardsByTierId, loading };
};
