export interface UserQuestTaskProgress {
  userQuestTaskId: number;
  questTaskId: number;
  type: 'VISIT' | 'REVIEW' | 'ORDER_AMOUNT' | 'SHARE';
  targetValue: number;
  description?: string | null;
  rewardType: 'BADGE' | 'POINTS' | 'VOUCHER';
  rewardValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: string | null;
  rewardClaimed: boolean;
}
