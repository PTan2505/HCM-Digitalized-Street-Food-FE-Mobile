import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface Setting {
  id: number;
  name: string;
  value: string;
}

export class SettingsApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getSettings(): Promise<Setting[]> {
    const res = await this.apiClient.get<Setting[]>({
      url: apiUrl.setting.getAll,
    });
    return res.data;
  }
}
