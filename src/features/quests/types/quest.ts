export type QuestTaskType =
  | 'REVIEW'
  | 'ORDER_AMOUNT'
  | 'SHARE'
  | 'CREATE_GHOST_PIN';
export type QuestRewardType = 'BADGE' | 'POINTS' | 'VOUCHER';
export type UserQuestStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'STOPPED';

export interface QuestTaskResponse {
  questTaskId: number;
  questId: number;
  type: QuestTaskType;
  targetValue: number;
  description: string | null;
  rewardType: QuestRewardType;
  rewardValue: number;
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
  rewardType: QuestRewardType;
  rewardValue: number;
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
  type: string;
  discountValue: number;
  maxDiscountValue: number | null;
  remain: number;
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
