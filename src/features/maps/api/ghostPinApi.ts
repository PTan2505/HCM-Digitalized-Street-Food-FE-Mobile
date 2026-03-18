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
}
