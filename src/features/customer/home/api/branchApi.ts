import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type {
  BranchDetail,
  DayOff,
  PaginatedBranchImages,
  PaginatedBranches,
  PaginatedDishes,
  PaginatedMyGhostPinBranches,
  PaginatedSimilarBranches,
  WorkSchedule,
} from '@features/customer/home/types/branch';

export class BranchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getBranchById(branchId: number): Promise<BranchDetail> {
    const res = await this.apiClient.get<BranchDetail>({
      url: apiUrl.branch.byId(branchId),
    });
    return res.data;
  }

  async getActiveBranches(
    pageNumber = 1,
    pageSize = 10,
    extra?: {
      Lat?: number;
      Long?: number;
      Distance?: number;
      IsSubscribed?: boolean;
      DietaryIds?: number[];
      TasteIds?: number[];
      MinPrice?: number;
      MaxPrice?: number;
      CategoryIds?: number[];
      Wards?: string[];
    }
  ): Promise<PaginatedBranches> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: apiUrl.branch.active,
      params: { pageNumber, pageSize, ...extra },
    });
    return res.data;
  }

  async getBranchesByVendor(
    vendorId: number,
    pageNumber = 1,
    pageSize = 10,
    onlyActive = true
  ): Promise<PaginatedBranches> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: `${apiUrl.branch.byVendor}/${vendorId}`,
      params: { pageNumber, pageSize, onlyActive },
    });
    return res.data;
  }

  async getWorkSchedules(branchId: number): Promise<WorkSchedule[]> {
    const res = await this.apiClient.get<WorkSchedule[]>({
      url: apiUrl.branch.workSchedules(branchId),
    });
    return res.data;
  }

  async getDayOffs(branchId: number): Promise<DayOff[]> {
    const res = await this.apiClient.get<DayOff[]>({
      url: apiUrl.branch.dayOffs(branchId),
    });
    return res.data;
  }

  async getDishesByBranch(
    branchId: number,
    params?: {
      categoryId?: number;
      keyword?: string;
      pageNumber?: number;
      pageSize?: number;
    }
  ): Promise<PaginatedDishes> {
    const res = await this.apiClient.get<PaginatedDishes>({
      url: apiUrl.dish.byBranch(branchId),
      params,
    });
    return res.data;
  }

  async getMyGhostPins(): Promise<PaginatedMyGhostPinBranches> {
    const res = await this.apiClient.get<PaginatedMyGhostPinBranches>({
      url: apiUrl.branch.myGhostPins,
    });
    return res.data;
  }

  async getSimilarBranches(
    branchId: number,
    pageNumber = 1,
    pageSize = 5
  ): Promise<PaginatedSimilarBranches> {
    const res = await this.apiClient.get<PaginatedSimilarBranches>({
      url: apiUrl.branch.similar(branchId),
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
      url: `/api/Branch/${branchId}/images`,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async getAllGhostPins(
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedBranches> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: apiUrl.branch.allGhostPins,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }
}
