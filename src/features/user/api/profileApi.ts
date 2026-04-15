import type { User } from '@custom-types/user';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class UserProfileApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserProfile(): Promise<User> {
    const res = await this.apiClient.get<User>({
      url: apiUrl.user.profile,
    });
    return res.data;
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const res = await this.apiClient.put<User, Partial<User>>({
      url: apiUrl.user.profile,
      data,
    });
    return res.data;
  }

  async markUserInfoSetup(): Promise<void> {
    await this.apiClient.put<void, null>({
      url: apiUrl.user.userSetup.userinfo,
    });
  }

  async markDietarySetup(): Promise<void> {
    await this.apiClient.put<void, null>({
      url: apiUrl.user.userSetup.dietary,
    });
  }
}
