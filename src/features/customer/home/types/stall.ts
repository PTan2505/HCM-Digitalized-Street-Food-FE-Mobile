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
  totalReviewCount: number;
  finalScore: number;
  distanceKm: number | null;
  isVerified: boolean;
  isActive: boolean;
  isSubscribed: boolean;
  /** Ranking score from DisplayName bucket (100/80/50–70/0) */
  displayNameScore?: number;
  /** Best dish score for this branch */
  dishScore?: number;
  /** Other branches of the same vendor, closest first */
  otherBranches?: SearchBranchResult[];
  dishes: {
    dishId: number;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    isSoldOut: boolean;
    categoryName?: string;
    /** Dish relevance score from keyword matching */
    score?: number;
    /** True when dish is in vendor's top-5 best sellers */
    isBestSeller?: boolean;
    /** True when vendor has explicitly flagged this as a signature dish */
    isSignature?: boolean;
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
  Lat?: number;
  Long?: number;
  Distance?: number;
  /** Numeric dietary preference IDs from /DietaryPreference */
  DietaryIds?: number[];
  /** Numeric taste tag IDs */
  TasteIds?: number[];
  MinPrice?: number;
  MaxPrice?: number;
  /** Numeric category IDs from /api/categories */
  CategoryIds?: number[];
  /** Ward names to filter by (OR logic) */
  Wards?: string[];
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
