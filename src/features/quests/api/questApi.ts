import type ApiClient from '@lib/api/apiClient';

import type {
  PaginatedQuests,
  QuestResponse,
  UserQuestProgress,
} from '@features/quests/types/quest';

export class QuestApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getPublicQuests(
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedQuests> {
    const res = await this.apiClient.get<PaginatedQuests>({
      url: '/api/Quest/public',
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async getQuestById(questId: number): Promise<QuestResponse> {
    const res = await this.apiClient.get<QuestResponse>({
      url: `/api/Quest/${questId}`,
    });
    return res.data;
  }

  async enrollInQuest(questId: number): Promise<UserQuestProgress> {
    const res = await this.apiClient.post<UserQuestProgress, null>({
      url: `/api/Quest/${questId}/enroll`,
    });
    return res.data;
  }

  async getMyQuests(status?: string): Promise<UserQuestProgress[]> {
    const res = await this.apiClient.get<UserQuestProgress[]>({
      url: '/api/Quest/my',
      params: status ? { status } : undefined,
    });
    return res.data;
  }

  async checkIn(branchId: number): Promise<void> {
    await this.apiClient.post<void, null>({
      url: `/api/Quest/checkin/${branchId}`,
    });
  }

  async shareStall(branchId: number): Promise<void> {
    await this.apiClient.post<void, null>({
      url: `/api/Quest/share/${branchId}`,
    });
  }
}
