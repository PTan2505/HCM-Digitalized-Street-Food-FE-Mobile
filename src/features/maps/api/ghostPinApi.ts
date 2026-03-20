import type { ApiResponse } from '@custom-types/apiResponse';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface CreateGhostPinRequest {
  name: string;
  addressDetail: string;
  ward: string | null;
  city: string;
  lat: number;
  long: number;
}

export type GhostPinStatus =
  | 'pending'
  | 'approved'
  | 'claimed'
  | 'verified'
  | 'rejected';

export interface GhostPinResponse {
  ghostPinId: string;
  name: string;
  lat: number;
  long: number;
  status: GhostPinStatus;
  branchId?: number; // Optional branchId for image upload
}

export interface UploadImagesResponse {
  uploadedCount: number;
  imageUrls: string[];
}

export class GhostPinApi {
  private apiClient: ApiClient;

  constructor(client: ApiClient) {
    this.apiClient = client;
  }

  createGhostPin(
    data: CreateGhostPinRequest
  ): Promise<ApiResponse<GhostPinResponse>> {
    return this.apiClient.post<GhostPinResponse, CreateGhostPinRequest>({
      url: apiUrl.ghostPin.create,
      data,
    });
  }

  async uploadBranchImages(
    branchId: number,
    formData: FormData
  ): Promise<UploadImagesResponse> {
    const res = await this.apiClient.post<UploadImagesResponse, FormData>({
      url: apiUrl.branch.images(branchId),
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
}
