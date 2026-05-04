import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type {
  CreateOrUpdateBranchResponse,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  ManagerBranch,
  SubmitImagesResponse,
  SubmitLicenseResponse,
  UpdateBranchRequest,
  VendorRegistrationRequest,
  VendorRegistrationResponse,
} from '@manager/branch/branch.types';
import type { DietaryPreference } from '@user/types/dietaryPreference';

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

export interface PickedFile {
  uri: string;
  mimeType: string;
  fileName: string;
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

  async getMyVendorDietaryPreferences(
    vendorId: number
  ): Promise<DietaryPreference[]> {
    const res = await this.apiClient.get<DietaryPreference[]>({
      url: apiUrl.vendorBranch.dietaryPreferences(vendorId),
    });
    return res.data;
  }

  async updateMyVendorDietaryPreferences(
    dietaryPreferenceIds: number[]
  ): Promise<DietaryPreference[]> {
    const res = await this.apiClient.put<DietaryPreference[], number[]>({
      url: apiUrl.vendorBranch.updateMyDietaryPreferences,
      data: dietaryPreferenceIds,
    });
    return res.data;
  }

  async claimBranch(
    branchId: number,
    licenseImages: PickedFile[]
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append('branchId', String(branchId));
    licenseImages.forEach((img) => {
      formData.append('licenseImages', {
        uri: img.uri,
        type: img.mimeType,
        name: img.fileName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });
    const res = await this.apiClient.post<unknown, FormData>({
      url: apiUrl.vendorBranch.claimBranch,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async registerVendor(
    data: VendorRegistrationRequest
  ): Promise<VendorRegistrationResponse> {
    const res = await this.apiClient.post<
      VendorRegistrationResponse,
      VendorRegistrationRequest
    >({
      url: apiUrl.vendorBranch.registerVendor,
      data,
    });
    return res.data;
  }

  async createBranch(
    vendorId: number,
    data: VendorRegistrationRequest
  ): Promise<CreateOrUpdateBranchResponse> {
    const res = await this.apiClient.post<
      CreateOrUpdateBranchResponse,
      VendorRegistrationRequest
    >({
      url: apiUrl.vendorBranch.createBranchForVendor(vendorId),
      data,
    });
    return res.data;
  }

  async submitLicense(
    branchId: number,
    licenseImages: PickedFile[]
  ): Promise<SubmitLicenseResponse> {
    const formData = new FormData();
    licenseImages.forEach((img) => {
      formData.append('licenseImages', {
        uri: img.uri,
        type: img.mimeType,
        name: img.fileName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });
    const res = await this.apiClient.post<SubmitLicenseResponse, FormData>({
      url: apiUrl.vendorBranch.submitLicense(branchId),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async submitImages(
    branchId: number,
    images: PickedFile[]
  ): Promise<SubmitImagesResponse[]> {
    const formData = new FormData();
    images.forEach((img) => {
      formData.append('images', {
        uri: img.uri,
        type: img.mimeType,
        name: img.fileName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });
    const res = await this.apiClient.post<SubmitImagesResponse[], FormData>({
      url: apiUrl.vendorBranch.submitImages(branchId),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async createSubscriptionPaymentLink(
    data: CreatePaymentLinkRequest
  ): Promise<CreatePaymentLinkResponse> {
    const res = await this.apiClient.post<
      CreatePaymentLinkResponse,
      CreatePaymentLinkRequest
    >({
      url: apiUrl.payment.createLink,
      data,
    });
    return res.data;
  }
}
