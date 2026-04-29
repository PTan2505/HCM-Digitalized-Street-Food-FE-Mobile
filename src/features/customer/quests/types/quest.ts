export type QuestTaskType =
  | 'REVIEW'
  | 'ORDER_AMOUNT'
  | 'SHARE'
  | 'CREATE_GHOST_PIN'
  | 'TIER_UP';
export type QuestRewardType = 'BADGE' | 'POINTS' | 'VOUCHER';
export type UserQuestStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'STOPPED';

export interface QuestTaskRewardItem {
  questTaskRewardId: number;
  rewardType: QuestRewardType;
  rewardValue: number;
  quantity: number;
}

export interface QuestTaskResponse {
  questTaskId: number;
  questId: number;
  type: QuestTaskType;
  targetValue: number;
  description: string | null;
  rewards: QuestTaskRewardItem[];
}

export interface QuestResponse {
  questId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isStandalone: boolean;
  requiresEnrollment: boolean;
  campaignId: number | null;
  createdAt: string;
  updatedAt: string | null;
  taskCount: number;
  tasks: QuestTaskResponse[];
}

export interface UserQuestTaskProgress {
  userQuestTaskId: number;
  questTaskId: number;
  type: QuestTaskType;
  targetValue: number;
  description: string | null;
  rewards: QuestTaskRewardItem[];
  currentValue: number;
  isCompleted: boolean;
  completedAt: string | null;
  rewardClaimed: boolean;
}

export interface UserQuestProgress {
  userQuestId: number;
  questId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  isStandalone: boolean;
  status: UserQuestStatus;
  startedAt: string;
  completedAt: string | null;
  campaignId: number | null;
  totalTasks: number;
  completedTasks: number;
  tasks: UserQuestTaskProgress[];
}

export interface QuestBadgeDetail {
  badgeId: number;
  badgeName: string;
  iconUrl: string;
  description: string | null;
}

export interface QuestVoucherDetail {
  voucherId: number;
  name: string;
  type: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number | null;
  remain: number;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: true;
  voucherCode: string;
  redeemPoint: number;
  quantity: number;
  usedQuantity: number;
  campaignId: number;
  isIndependentQuest: boolean;
}

export interface PaginatedQuests {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: QuestResponse[];
}

export interface PaginatedUserQuests {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: UserQuestProgress[];
}
