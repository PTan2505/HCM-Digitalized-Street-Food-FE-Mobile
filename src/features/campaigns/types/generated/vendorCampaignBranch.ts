export interface CampaignVoucherInfo {
  voucherId: number;
  name: string;
  type: string;
  discountValue: number;
  minAmountRequired: number;
  maxDiscountValue?: number | null;
  quantity: number;
  usedQuantity: number;
  remain: number;
  startDate: string;
  endDate: string;
  voucherCode: string;
}

export interface BranchCampaignInfo {
  campaignId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isWorking: boolean;
  vouchers: CampaignVoucherInfo[];
}

export interface VendorCampaignBranch {
  branchId: number;
  vendorId: number;
  vendorName?: string | null;
  managerId?: number | null;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  updatedAt?: string | null;
  isVerified: boolean;
  avgRating: number;
  totalReviewCount: number;
  isActive: boolean;
  tierId: number;
  tierName: string;
  finalScore: number;
  distanceKm?: number | null;
  campaigns: BranchCampaignInfo[];
}
