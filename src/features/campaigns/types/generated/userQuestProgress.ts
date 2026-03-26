import type { UserQuestTaskProgress } from './userQuestTaskProgress';

export interface UserQuestProgress {
  userQuestId: number;
  questId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  startedAt: string;
  completedAt?: string | null;
  campaignId?: number | null;
  totalTasks: number;
  completedTasks: number;
  tasks: UserQuestTaskProgress[];
}
