export interface ManagerBranch {
  branchId: number;
  vendorId: number;
  managerId: number;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  branchName: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  updatedAt: string | null;
  isVerified: boolean;
  avgRating: number;
  totalReviewCount: number | null;
  tierId?: number;
  tierName?: string;
  isActive: boolean;
  isSubscribed: boolean;
  daysRemaining: number | null;
  licenseUrl: string | null;
  licenseUrls: string[] | null;
  licenseStatus: string | null;
}

export interface UpdateBranchRequest {
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat?: number;
  long?: number;
  dietaryPreferenceIds?: number[];
}

export interface VendorRegistrationRequest {
  name?: string;
  phoneNumber: string;
  email: string;
  branchName?: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  dietaryPreferenceIds: number[];
  isActive?: boolean;
}

export interface VendorRegistrationResponse {
  vendorId: number;
  managerId: number;
  name: string;
  vendorOwnerName: string;
  branches: ManagerBranch[];
}

export interface CreateOrUpdateBranchResponse extends ManagerBranch {
  subscriptionExpiresAt: string | null;
}

export interface SubmitLicenseRequest {
  branchId: number;
  licenseImages: { uri: string; mimeType: string; fileName: string }[];
}

export interface SubmitLicenseResponse {
  branchId: number;
  licenseUrls: string[];
  status: string;
}

export interface SubmitImagesRequest {
  branchId: number;
  images: { uri: string; mimeType: string; fileName: string }[];
}

export interface SubmitImagesResponse {
  branchImageId: number;
  branchId?: number;
  imageUrl: string;
}

export interface CreatePaymentLinkRequest {
  branchId: number;
}

export interface CreatePaymentLinkResponse {
  paymentUrl: string;
  orderCode: string;
  paymentLinkId: string;
  requireConfirmation: boolean;
  success: boolean;
  message?: string;
  bin?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  amount?: number | null;
}
