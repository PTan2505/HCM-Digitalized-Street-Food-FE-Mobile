import { useMemo } from 'react';

export interface QuestProgress {
  campaignId: string;
  questDescription: string;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useQuestProgress = (_campaignId?: string) => {
  const quests: QuestProgress[] = [];

  const campaignQuest = useMemo(() => null, []);
  const activeQuests = useMemo(() => quests.filter((q) => !q.isCompleted), []);
  const completedQuests = useMemo(
    () => quests.filter((q) => q.isCompleted),
    []
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
