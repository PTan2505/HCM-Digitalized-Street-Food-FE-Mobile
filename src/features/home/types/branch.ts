import type { VendorTier } from '@custom-types/vendor';

export interface WorkSchedule {
  workScheduleId: number;
  branchId: number;
  /** 0 = Sunday, 1 = Monday, …, 6 = Saturday — matches JS Date.getDay() */
  weekday: number;
  weekdayName: string;
  /** 24-hour format "HH:mm:ss" */
  openTime: string;
  /** 24-hour format "HH:mm:ss" */
  closeTime: string;
}

export interface Dish {
  dishId: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isSoldOut: boolean;
  categoryName?: string;
  tasteNames: string[];
}

export interface BranchDetail {
  branchId: number;
  vendorId: number;
  managerId: number;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  updatedAt: string | null;
  isVerified: boolean;
  isSubscribed: boolean;
  avgRating: number;
  totalReviewCount: number;
  isActive: boolean;
  tierId: number;
  tierName: string | null;
}

export interface ActiveBranch {
  branchId: number;
  vendorId: number;
  vendorName: string;
  managerId: number;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  totalReviewCount: number;
  totalRatingSum: number;
  dietaryPreferenceNames: string[];
  updatedAt: string | null;
  isVerified: boolean;
  avgRating: number;
  isActive: boolean;
  isSubscribed: boolean;
  tierId: number;
  tierName: string;
  /** Composite score (0–1) used for map marker visibility priority */
  finalScore: number;
  /** Populated when Lat/Long params are passed to the search endpoint */
  distanceKm: number | null;
  dishes: Dish[];
  /** Optional tier from GET /api/Branch/:id/tier — not included in search response */
  tier?: VendorTier;
}

export interface PaginatedBranches {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: ActiveBranch[];
}

export interface BranchImage {
  branchImageId: number;
  branchId: number;
  imageUrl: string;
}

export interface PaginatedDishes {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Dish[];
}

export type LicenseStatus = 'Pending' | 'Accept' | 'Reject';

export interface MyGhostPinBranch {
  branchId: number;
  vendorId: number;
  managerId: number | null;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  updatedAt: string | null;
  isVerified: boolean;
  avgRating: number;
  totalReviewCount: number;
  totalRatingSum: number;
  batchReviewCount: number;
  batchRatingSum: number;
  isActive: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt: string | null;
  daysRemaining: number | null;
  tierId: number;
  tierName: string;
  licenseUrls: string[];
  licenseStatus: LicenseStatus;
  licenseRejectReason: string | null;
}

export interface PaginatedMyGhostPinBranches {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: MyGhostPinBranch[];
}

export interface SimilarBranch {
  branchId: number;
  vendorId: number;
  vendorName: string;
  name: string;
  addressDetail: string;
  ward?: string;
  city: string;
  lat: number;
  long: number;
  avgRating: number;
  totalReviewCount: number;
  isSubscribed: boolean;
  commonDishCount: number;
  similarityScore: number;
  sharedDishNames: string[];
}

export interface PaginatedSimilarBranches {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: SimilarBranch[];
}

export interface PaginatedBranchImages {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: BranchImage[];
}
