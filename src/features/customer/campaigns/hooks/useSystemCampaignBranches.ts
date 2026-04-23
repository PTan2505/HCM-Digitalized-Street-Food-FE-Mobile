import type { VendorCampaignBranch } from '@features/customer/campaigns/types/generated';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { orvalMutator } from '@lib/api/orvalMutator';
import { selectUserDietaryPreferences } from '@slices/dietary';
import { useQuery } from '@tanstack/react-query';

interface SystemCampaignBranchesParams {
  campaignId: number;
  lat?: number | null;
  lng?: number | null;
}

const fetchSystemCampaignBranches = (
  params: SystemCampaignBranchesParams
): Promise<{
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: VendorCampaignBranch[];
}> =>
  orvalMutator({
    url: `/api/Campaign/system/${params.campaignId}/branches`,
    method: 'GET',
    params: {
      pageNumber: 1,
      pageSize: 50,
      lat: params.lat ?? null,
      lng: params.lng ?? null,
    },
  });

const mapActiveBranchToVendorCampaignBranch = (
  branch: ActiveBranch
): VendorCampaignBranch => ({
  branchId: branch.branchId,
  vendorId: branch.vendorId ?? 0,
  vendorName: branch.vendorName,
  managerId: branch.managerId,
  name: branch.name,
  phoneNumber: branch.phoneNumber,
  email: branch.email,
  addressDetail: branch.addressDetail,
  ward: branch.ward,
  city: branch.city,
  lat: branch.lat,
  long: branch.long,
  createdAt: branch.createdAt,
  updatedAt: branch.updatedAt,
  isVerified: branch.isVerified,
  avgRating: branch.avgRating,
  totalReviewCount: branch.totalReviewCount,
  isActive: branch.isActive,
  tierId: branch.tierId,
  tierName: branch.tierName,
  finalScore: branch.finalScore,
  distanceKm: branch.distanceKm,
  isSubscribed: branch.isSubscribed,
  campaigns: [],
});

export const useSystemCampaignBranches = (
  campaignId: number | null | undefined,
  coords?: { latitude: number; longitude: number } | null
): {
  branches: VendorCampaignBranch[];
  imageMap: Record<number, string>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} => {
  const lat = coords?.latitude ?? null;
  const lng = coords?.longitude ?? null;
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const dietaryIds = userDietaryPreferences.map((p) => p.dietaryPreferenceId);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'campaigns',
      'systemBranches',
      campaignId,
      { lat, lng },
      dietaryIds,
    ] as const,
    queryFn: async () => {
      const items =
        campaignId == null
          ? (
              await axiosApi.branchApi.getActiveBranches(1, 50, {
                Lat: lat ?? undefined,
                Long: lng ?? undefined,
                DietaryIds: dietaryIds,
                IsSubscribed: true,
              })
            ).items.map(mapActiveBranchToVendorCampaignBranch)
          : (
              await fetchSystemCampaignBranches({
                campaignId,
                lat,
                lng,
              })
            ).items;

      const imageResults = await Promise.all(
        items.map((branch) =>
          axiosApi.branchApi
            .getBranchImages(branch.branchId, 1, 1)
            .then((res) => ({
              branchId: branch.branchId,
              imageUrl: res.items[0]?.imageUrl ?? null,
            }))
            .catch(() => ({ branchId: branch.branchId, imageUrl: null }))
        )
      );

      const imageMap: Record<number, string> = Object.fromEntries(
        imageResults
          .filter(
            (r): r is { branchId: number; imageUrl: string } =>
              r.imageUrl !== null
          )
          .map((r) => [r.branchId, r.imageUrl])
      );

      return { items, imageMap };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    branches: data?.items ?? [],
    imageMap: data?.imageMap ?? {},
    isLoading,
    isError,
    refetch,
  };
};
