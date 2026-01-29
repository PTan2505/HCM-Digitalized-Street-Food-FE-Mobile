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
      url: apiUrl.auth.profile,
    });
    return res.data;
  }
}
