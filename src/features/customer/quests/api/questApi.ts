import type ApiClient from '@lib/api/apiClient';

import type {
  PaginatedQuests,
  PaginatedUserQuests,
  QuestBadgeDetail,
  QuestResponse,
  QuestTaskResponse,
  QuestVoucherDetail,
  UserQuestProgress,
} from '@features/customer/quests/types/quest';

export class QuestApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getPublicQuests(
    pageNumber = 1,
    pageSize = 10,
    isStandalone?: boolean,
    isTierUp?: boolean
  ): Promise<PaginatedQuests> {
    const res = await this.apiClient.get<PaginatedQuests>({
      url: '/api/Quest/public',
      params: {
        pageNumber,
        pageSize,
        ...(isStandalone !== undefined && { isStandalone }),
        ...(isTierUp !== undefined && { isTierUp }),
      },
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

  async getMyQuests(
    status?: string,
    isTierUp?: boolean,
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedUserQuests> {
    const res = await this.apiClient.get<PaginatedUserQuests>({
      url: '/api/Quest/my',
      params: {
        ...(status && { status }),
        ...(isTierUp !== undefined && { isTierUp }),
        pageNumber,
        pageSize,
      },
    });
    return res.data;
  }

  async stopQuest(questId: number): Promise<UserQuestProgress> {
    const res = await this.apiClient.post<UserQuestProgress, null>({
      url: `/api/Quest/${questId}/stop`,
    });
    return res.data;
  }

  async getQuestTaskById(questTaskId: number): Promise<QuestTaskResponse> {
    const res = await this.apiClient.get<QuestTaskResponse>({
      url: `/api/Quest/task/${questTaskId}`,
    });
    return res.data;
  }

  async getBadgeById(badgeId: number): Promise<QuestBadgeDetail> {
    const res = await this.apiClient.get<QuestBadgeDetail>({
      url: `/api/Badge/${badgeId}`,
    });
    return res.data;
  }

  async getVoucherById(voucherId: number): Promise<QuestVoucherDetail> {
    const res = await this.apiClient.get<QuestVoucherDetail>({
      url: `/api/vouchers/${voucherId}`,
    });
    return res.data;
  }

  async getCampaignById(campaignId: number): Promise<{ name: string }> {
    const res = await this.apiClient.get<{ name: string }>({
      url: `/api/Campaign/${campaignId}`,
    });
    return res.data;
  }

  async shareStall(branchId: number): Promise<void> {
    await this.apiClient.post<void, null>({
      url: `/api/Quest/share/${branchId}`,
    });
  }

  async uploadQuestImage(
    questId: number,
    formData: FormData
  ): Promise<QuestResponse> {
    const res = await this.apiClient.post<QuestResponse, FormData>({
      url: `/api/Quest/${questId}/image`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
}
