import { useAppSelector } from '@hooks/reduxHooks';
import { selectQuests, type QuestProgress } from '@slices/campaigns';
import { useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useQuestProgress = (campaignId?: string) => {
  const quests = useAppSelector(selectQuests);

  const campaignQuest = useMemo(
    () =>
      campaignId
        ? (quests.find((q) => q.campaignId === campaignId) ?? null)
        : null,
    [quests, campaignId]
  );

  const activeQuests = useMemo(
    () => quests.filter((q) => !q.isCompleted),
    [quests]
  );

  const completedQuests = useMemo(
    () => quests.filter((q) => q.isCompleted),
    [quests]
  );

  const getProgressPercentage = (quest: QuestProgress): number => {
    if (quest.targetProgress === 0) return 100;
    return Math.min(
      Math.round((quest.currentProgress / quest.targetProgress) * 100),
      100
    );
  };

  return {
    quests,
    campaignQuest,
    activeQuests,
    completedQuests,
    getProgressPercentage,
  };
};
