import type ApiClient from '@lib/api/apiClient';
import type { ManagerBranch, UpdateBranchRequest } from '@manager/types/branch';

const MANAGER_BRANCH_URLS = {
  myBranch: '/api/Branch/manager/my-branch',
  byId: (branchId: number): string => `/api/Branch/${branchId}`,
} as const;

export class ManagerBranchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getManagerMyBranch(): Promise<ManagerBranch> {
    const res = await this.apiClient.get<ManagerBranch>({
      url: MANAGER_BRANCH_URLS.myBranch,
    });
    return res.data;
  }

  async updateBranch(
    branchId: number,
    data: UpdateBranchRequest
  ): Promise<ManagerBranch> {
    const res = await this.apiClient.put<ManagerBranch, UpdateBranchRequest>({
      url: MANAGER_BRANCH_URLS.byId(branchId),
      data,
    });
    return res.data;
  }
}
