import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type {
  ManagerBranch,
  UpdateBranchRequest,
} from '@manager/branch/branch.types';

export interface VendorInfo {
  vendorId: number;
  name: string;
  managerId: number;
  vendorOwnerName: string | null;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  branches: ManagerBranch[];
}

export class VendorBranchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVendorInfo(): Promise<VendorInfo> {
    const res = await this.apiClient.get<VendorInfo>({
      url: apiUrl.vendorBranch.me,
    });
    return res.data;
  }

  async updateBranch(
    branchId: number,
    data: UpdateBranchRequest
  ): Promise<ManagerBranch> {
    const res = await this.apiClient.put<ManagerBranch, UpdateBranchRequest>({
      url: apiUrl.vendorBranch.byId(branchId),
      data,
    });
    return res.data;
  }
}
