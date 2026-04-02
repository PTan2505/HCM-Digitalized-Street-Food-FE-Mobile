export interface QuestTaskResponse {
  questTaskId: number;
  type: 'VISIT' | 'REVIEW' | 'ORDER_AMOUNT' | 'SHARE';
  targetValue: number;
  description?: string | null;
  rewardType: 'BADGE' | 'POINTS' | 'VOUCHER';
  rewardValue: number;
}
