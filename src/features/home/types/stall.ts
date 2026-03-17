/** Tier badge — backend format TBD; used for UI display only until decided */
export type VendorTier = 'diamond' | 'gold' | 'silver' | 'warning';

/** Maps to GET /api/Branch/active query params */
export interface StallSearchParams {
  Lat: number;
  Long: number;
  Distance?: number;
  /** Numeric dietary preference IDs from /DietaryPreference */
  DietaryIds?: number[];
  /** Numeric taste tag IDs — mapping TBD */
  TasteIds?: number[];
  MinPrice?: number;
  MaxPrice?: number;
  Keyword?: string;
  pageNumber?: number;
  pageSize?: number;
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
