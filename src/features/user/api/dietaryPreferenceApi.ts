import { DietaryPreference } from '@features/user/types/dietaryPreference';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class DietaryPreferenceApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllDietaryPreferences(): Promise<DietaryPreference[]> {
    const res = await this.apiClient.get<DietaryPreference[]>({
      url: apiUrl.dietaryPreference.getAll,
    });
    return res.data;
  }
}
