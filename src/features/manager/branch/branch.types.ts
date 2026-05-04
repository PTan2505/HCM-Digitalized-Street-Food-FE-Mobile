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
}
