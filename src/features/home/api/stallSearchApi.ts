import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type { ActiveBranch, PaginatedBranches } from '@features/home/types/branch';
import type { StallSearchParams } from '@features/home/types/stall';

export class StallSearchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async searchStalls(params: StallSearchParams): Promise<PaginatedBranches> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: apiUrl.branch.active,
      params,
    });
    return res.data;
  }

  async getMapVendors(
    lat: number,
    lng: number,
    distanceKm = 5
  ): Promise<ActiveBranch[]> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: apiUrl.branch.active,
      params: { Lat: lat, Long: lng, Distance: distanceKm, pageSize: 100 },
    });
    return res.data.items;
  }
}
