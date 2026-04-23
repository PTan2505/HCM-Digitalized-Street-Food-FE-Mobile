import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type {
  ActiveBranch,
  PaginatedBranches,
} from '@features/customer/home/types/branch';
import type {
  SearchApiData,
  StallSearchParams,
} from '@features/customer/home/types/stall';

export class StallSearchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async searchStalls(params: StallSearchParams): Promise<ActiveBranch[]> {
    const res = await this.apiClient.get<SearchApiData>({
      url: apiUrl.search.vendorWithBranch,
      params,
    });
    return res.data.results.flatMap((vendor) =>
      vendor.branches.map((branch) => ({
        branchId: branch.branchId,
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        managerId: vendor.managerId,
        name: branch.name,
        phoneNumber: '',
        email: '',
        addressDetail: branch.addressDetail,
        ward: branch.ward,
        city: branch.city,
        lat: branch.lat,
        long: branch.long,
        createdAt: '',
        updatedAt: null,
        isVerified: branch.isVerified,
        avgRating: branch.avgRating,
        totalReviewCount: branch.totalReviewCount ?? 0,
        totalRatingSum: 0,
        isActive: branch.isActive,
        isSubscribed: branch.isSubscribed,
        tierId: 0,
        tierName: '',
        finalScore: branch.finalScore ?? 0,
        distanceKm: branch.distanceKm ?? null,
        dishes: branch.dishes.map((d) => ({ ...d, tasteNames: [] })),
        dietaryPreferenceNames: [],
      }))
    );
  }

  async getMapVendors(
    lat: number,
    lng: number,
    distanceKm = 5
  ): Promise<ActiveBranch[]> {
    const res = await this.apiClient.get<PaginatedBranches>({
      url: apiUrl.branch.active,
      params: { Lat: lat, Long: lng, Distance: distanceKm, pageSize: 100 },
    });
    return res.data.items;
  }
}
