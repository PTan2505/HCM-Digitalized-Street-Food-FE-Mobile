import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { PaginatedBranches } from '@features/customer/home/types/branch';
import type {
  SearchApiData,
  SearchBranchResult,
  StallSearchParams,
} from '@features/customer/home/types/stall';

function mapBranchResultToActiveBranch(
  branch: SearchBranchResult,
  vendorId: number,
  vendorName: string,
  managerId: number,
  otherBranches?: ActiveBranch[]
): ActiveBranch {
  return {
    branchId: branch.branchId,
    vendorId,
    vendorName,
    managerId,
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
    dietaryPreferenceNames: [],
    dishes: (branch.dishes ?? []).map((d) => ({
      ...d,
      tasteNames: [],
      score: d.score,
      isBestSeller: d.isBestSeller,
      isSignature: d.isSignature,
    })),
    displayNameScore: branch.displayNameScore,
    dishScore: branch.dishScore,
    otherBranches,
  };
}

export class StallSearchApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async searchStalls(params: StallSearchParams): Promise<ActiveBranch[]> {
    const res = await this.apiClient.get<SearchApiData>({
      url: apiUrl.search.vendorWithBranch,
      params: { ...params, rankingV2: 1 },
    });

    return res.data.results
      .map((vendor) => {
        const primary = vendor.branches[0];
        if (!primary) return null;

        const siblings = (primary.otherBranches ?? []).map((sib) =>
          mapBranchResultToActiveBranch(
            sib,
            vendor.vendorId,
            vendor.vendorName,
            vendor.managerId
          )
        );

        return mapBranchResultToActiveBranch(
          primary,
          vendor.vendorId,
          vendor.vendorName,
          vendor.managerId,
          siblings
        );
      })
      .filter((b): b is ActiveBranch => b !== null);
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
