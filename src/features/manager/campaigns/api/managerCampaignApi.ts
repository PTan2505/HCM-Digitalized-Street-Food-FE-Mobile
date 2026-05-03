import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface VendorCampaign {
  campaignId: number;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl: string | null;
  branchIds: number[] | null;
}

export interface SystemCampaign {
  campaignId: number;
  name: string;
  description: string | null;
  registrationStartDate: string;
  registrationEndDate: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isRegisterable: boolean;
  imageUrl: string | null;
  joinedBranchIds?: number[] | null;
}

export interface PaginatedVendorCampaigns {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  items: VendorCampaign[];
}

export interface CreateCampaignRequest {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  branchIds?: number[];
}

export interface UpdateCampaignRequest {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
}

export interface JoinSystemCampaignRequest {
  branchIds: number[];
}

export class ManagerCampaignApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVendorCampaigns(
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedVendorCampaigns> {
    const res = await this.apiClient.get<PaginatedVendorCampaigns>({
      url: apiUrl.vendorCampaign.vendorList,
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async getCampaignById(id: number): Promise<VendorCampaign> {
    const res = await this.apiClient.get<VendorCampaign>({
      url: apiUrl.vendorCampaign.byId(id),
    });
    return res.data;
  }

  async createCampaign(data: CreateCampaignRequest): Promise<VendorCampaign> {
    const res = await this.apiClient.post<
      VendorCampaign,
      CreateCampaignRequest
    >({
      url: apiUrl.vendorCampaign.create,
      data,
    });
    return res.data;
  }

  async updateCampaign(
    id: number,
    data: UpdateCampaignRequest
  ): Promise<VendorCampaign> {
    const res = await this.apiClient.put<VendorCampaign, UpdateCampaignRequest>(
      {
        url: apiUrl.vendorCampaign.update(id),
        data,
      }
    );
    return res.data;
  }

  async getSystemJoinableCampaigns(): Promise<SystemCampaign[]> {
    const res = await this.apiClient.get<SystemCampaign[]>({
      url: apiUrl.vendorCampaign.systemJoinable,
    });
    return res.data;
  }

  async getSystemCampaignById(id: number): Promise<SystemCampaign> {
    const res = await this.apiClient.get<SystemCampaign>({
      url: apiUrl.vendorCampaign.systemById(id),
    });
    return res.data;
  }

  async joinSystemCampaign(
    id: number,
    data: JoinSystemCampaignRequest
  ): Promise<void> {
    await this.apiClient.post<void, JoinSystemCampaignRequest>({
      url: apiUrl.vendorCampaign.joinSystem(id),
      data,
    });
  }
}
