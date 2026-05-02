import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface Tier {
  tierId: number;
  name: string;
  weight: number;
}

export class TierApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getTiers(): Promise<Tier[]> {
    const res = await this.apiClient.get<Tier[]>({
      url: apiUrl.tier.getAll,
    });
    return res.data;
  }
}
