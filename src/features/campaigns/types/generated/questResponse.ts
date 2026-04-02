import type { QuestTaskResponse } from './questTaskResponse';

export interface QuestResponse {
  questId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  campaignId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  taskCount: number;
  tasks: QuestTaskResponse[];
}
