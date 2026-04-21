import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type { Taste } from '@features/customer/home/types/taste';

export class TasteApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getTastes(): Promise<Taste[]> {
    const res = await this.apiClient.get<Taste[]>({
      url: apiUrl.taste.getAll,
    });
    return res.data;
  }
}
