export type { VendorTier } from '@custom-types/vendor';

/** Branch shape returned inside GET /api/searchVendorWithBranch results */
export interface SearchBranchResult {
  branchId: number;
  name: string;
  addressDetail: string;
  city: string;
  ward: string;
  lat: number;
  long: number;
  avgRating: number;
  finalScore: number;
  isVerified: boolean;
  isActive: boolean;
  dishes: {
    dishId: number;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    isSoldOut: boolean;
    categoryName?: string;
  }[];
}

/** Vendor shape returned inside GET /api/searchVendorWithBranch results */
export interface SearchVendorResult {
  vendorId: number;
  vendorName: string;
  managerId: number;
  isActive: boolean;
  branches: SearchBranchResult[];
}

/** Top-level data shape from GET /api/searchVendorWithBranch */
export interface SearchApiData {
  keyword: string | null;
  totalResults: number;
  results: SearchVendorResult[];
}

/** Maps to GET /api/searchVendorWithBranch query params */
export interface StallSearchParams {
  Keyword?: string;
  Lat: number;
  Long: number;
  Distance?: number;
  /** Numeric dietary preference IDs from /DietaryPreference */
  DietaryIds?: number[];
  /** Numeric taste tag IDs */
  TasteIds?: number[];
  MinPrice?: number;
  MaxPrice?: number;
  /** Numeric category IDs from /api/categories */
  CategoryIds?: number[];
}

/** Retained for Maps feature — wired to mock data until map API is confirmed */
export interface MapVendor {
  vendorId: string;
  name: string;
  lat: number;
  long: number;
  avgRating: number;
  tierId: string;
  isVerified: boolean;
  isActive: boolean;
  imageUrl: string;
  ward: string;
  addressDetail?: string;
}
