import { orvalMutator } from '@lib/api/orvalMutator';
import { axiosApi } from '@lib/api/apiInstance';
import type { VendorCampaignBranch } from '@features/campaigns/types/generated';
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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'campaigns',
      'systemBranches',
      campaignId,
      { lat, lng },
    ] as const,
    enabled: campaignId != null,
    queryFn: async () => {
      const result = await fetchSystemCampaignBranches({
        campaignId: campaignId!,
        lat,
        lng,
      });

      const items = result?.items ?? [];

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
