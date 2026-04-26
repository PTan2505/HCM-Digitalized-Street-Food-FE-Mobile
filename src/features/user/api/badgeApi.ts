import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type { UserBadge } from '@features/user/types/badge';

export class BadgeApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserBadges(): Promise<UserBadge[]> {
    const res = await this.apiClient.get<UserBadge[]>({
      url: apiUrl.badge.user,
    });
    return res.data;
  }

  async selectBadge(badgeId: number): Promise<void> {
    await this.apiClient.put<void, null>({
      url: apiUrl.badge.select(badgeId),
    });
  }

  async clearSelectedBadge(): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.badge.clearSelect,
    });
  }
}
