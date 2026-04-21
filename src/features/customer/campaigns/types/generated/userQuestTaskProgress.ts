import type { QuestTaskRewardItem } from './questTaskResponse';

export interface UserQuestTaskProgress {
  userQuestTaskId: number;
  questTaskId: number;
  type: 'VISIT' | 'REVIEW' | 'ORDER_AMOUNT' | 'SHARE' | 'TIER_UP';
  targetValue: number;
  description?: string | null;
  rewards: QuestTaskRewardItem[];
  currentValue: number;
  isCompleted: boolean;
  completedAt?: string | null;
  rewardClaimed: boolean;
}
