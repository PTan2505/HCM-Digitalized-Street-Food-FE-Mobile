export type FilterSection =
  | 'category'
  | 'priceRange'
  | 'distance'
  | 'dietary'
  | 'taste'
  | 'ward';

export interface FilterState {
  spaceTypes: string[];
  categoryIds: string[];
  minPrice: number;
  maxPrice: number;
  distance: number;
  hasParking: boolean;
  openNow: boolean;
  amenities: string[];
  tasteTags: string[];
  dietaryTags: string[];
  wards: string[];
}
