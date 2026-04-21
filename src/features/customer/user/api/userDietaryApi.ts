import {
  CreateOrUpdateUserDietaryRequest,
  CreateOrUpdateUserDietaryResponse,
  UserDietary,
} from '@features/customer/user/types//userDietary';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class UserDietaryApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserDietaryPreferences(): Promise<UserDietary[]> {
    const res = await this.apiClient.get<UserDietary[]>({
      url: apiUrl.userDietary.userDietary,
    });
    return res.data;
  }

  async createOrUpdateUserDietaryPreferences(
    data: CreateOrUpdateUserDietaryRequest
  ): Promise<CreateOrUpdateUserDietaryResponse> {
    const res = await this.apiClient.post<
      CreateOrUpdateUserDietaryResponse,
      CreateOrUpdateUserDietaryRequest
    >({
      url: apiUrl.userDietary.userDietary,
      data,
    });
    return res;
  }
}
