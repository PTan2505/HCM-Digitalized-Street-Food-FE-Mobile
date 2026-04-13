export interface QuestTaskRewardItem {
  questTaskRewardId: number;
  rewardType: 'BADGE' | 'POINTS' | 'VOUCHER';
  rewardValue: number;
  quantity: number;
}

export interface QuestTaskResponse {
  questTaskId: number;
  type: 'VISIT' | 'REVIEW' | 'ORDER_AMOUNT' | 'SHARE' | 'TIER_UP';
  targetValue: number;
  description?: string | null;
  rewards: QuestTaskRewardItem[];
}
