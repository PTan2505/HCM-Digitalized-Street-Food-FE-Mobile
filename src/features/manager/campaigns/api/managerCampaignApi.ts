import type { CreatePaymentLinkResponse } from '@manager/branch/branch.types';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface VendorCampaign {
  campaignId: number;
  name: string;
  description: string | null;
  targetSegment?: string | null;
  requiredTierId?: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isSystemCampaign?: boolean | null;
  imageUrl: string | null;
  branchIds: number[] | null;
}

export interface SystemCampaign {
  campaignId: number;
  name: string;
  description: string | null;
  targetSegment?: string | null;
  requiredTierId?: number | null;
  registrationStartDate: string;
  registrationEndDate: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isRegisterable: boolean;
  imageUrl: string | null;
  joinedBranchIds?: number[] | null;
  joinableBranch?: number[] | null;
  joinFee?: number | null;
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
  targetSegment?: string | null;
  startDate: string;
  endDate: string;
  branchIds?: number[] | null;
}

export interface UpdateCampaignRequest {
  name: string;
  description?: string | null;
  targetSegment?: string | null;
  startDate: string;
  endDate: string;
  branchIds?: number[] | null;
}

export interface CampaignImageAsset {
  uri: string;
  mimeType: string;
  fileName: string;
}

export interface JoinSystemCampaignRequest {
  branchIds: number[];
}

export interface PaginatedSystemCampaigns {
  totalCount: number;
  items: SystemCampaign[];
}

export interface CampaignBranchItem {
  branchId: number;
  name: string;
  addressDetail: string;
  ward: string;
  city: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface PaginatedCampaignBranches {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: CampaignBranchItem[];
}

export interface CampaignBranchesResponse {
  campaignId: number;
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

  async getSystemJoinableCampaigns(
    pageNumber = 1,
    pageSize = 20
  ): Promise<PaginatedSystemCampaigns> {
    const res = await this.apiClient.get<PaginatedSystemCampaigns>({
      url: apiUrl.vendorCampaign.systemJoinable,
      params: { pageNumber, pageSize },
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
  ): Promise<CreatePaymentLinkResponse> {
    const res = await this.apiClient.post<
      CreatePaymentLinkResponse,
      JoinSystemCampaignRequest
    >({
      url: apiUrl.vendorCampaign.joinSystem(id),
      data,
    });
    return res.data;
  }

  async getCampaignBranches(
    campaignId: number
  ): Promise<PaginatedCampaignBranches> {
    const res = await this.apiClient.get<PaginatedCampaignBranches>({
      url: apiUrl.vendorCampaign.vendorCampaignBranches(campaignId),
      params: { pageNumber: 1, pageSize: 100 },
    });
    return res.data;
  }

  async getSystemCampaignBranches(
    campaignId: number
  ): Promise<PaginatedCampaignBranches> {
    const res = await this.apiClient.get<PaginatedCampaignBranches>({
      url: apiUrl.vendorCampaign.systemCampaignBranches(campaignId),
      params: { pageNumber: 1, pageSize: 100 },
    });
    return res.data;
  }

  async addBranchesToCampaign(
    campaignId: number,
    branchIds: number[]
  ): Promise<CampaignBranchesResponse> {
    const res = await this.apiClient.post<
      CampaignBranchesResponse,
      { branchIds: number[] }
    >({
      url: apiUrl.vendorCampaign.addBranchesToCampaign(campaignId),
      data: { branchIds },
    });
    return res.data;
  }

  async removeBranchesFromCampaign(
    campaignId: number,
    branchIds: number[]
  ): Promise<CampaignBranchesResponse> {
    const res = await this.apiClient.post<
      CampaignBranchesResponse,
      { branchIds: number[] }
    >({
      url: apiUrl.vendorCampaign.removeBranchesFromCampaign(campaignId),
      data: { branchIds },
    });
    return res.data;
  }

  async deleteCampaign(campaignId: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.vendorCampaign.byId(campaignId),
    });
  }

  async uploadCampaignImage(
    campaignId: number,
    image: CampaignImageAsset
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      type: image.mimeType,
      name: image.fileName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const res = await this.apiClient.post<unknown, FormData>({
      url: apiUrl.vendorCampaignImage.images(campaignId),
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async deleteCampaignImage(campaignId: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.vendorCampaignImage.image(campaignId),
    });
  }
}
