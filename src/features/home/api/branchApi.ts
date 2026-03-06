import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type {
  PaginatedBranchImages,
  PaginatedBranches,
} from '@features/home/types/branch';

export class BranchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getActiveBranches(
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedBranches> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: apiUrl.branch.active,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async getBranchesByVendor(
    vendorId: number,
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedBranches> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: `${apiUrl.branch.byVendor}/${vendorId}`,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async getBranchImages(
    branchId: number,
    pageNumber = 1,
    pageSize = 1
  ): Promise<PaginatedBranchImages> {
    const res = await this.apiClient.get<PaginatedBranchImages>({
      url: `/Branch/${branchId}/images`,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }
}
