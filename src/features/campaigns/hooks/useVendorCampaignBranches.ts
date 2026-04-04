import { getLowcaAPIUnimplementedEndpoints } from '@features/campaigns/api/generated';
import type { VendorCampaignBranch } from '@features/campaigns/types/generated';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

export const useVendorCampaignBranches = (
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
    queryKey: queryKeys.campaigns.vendorBranches(lat, lng),
    queryFn: async () => {
      const result = await campaignApi.getVendorCampaignBranches({
        pageNumber: 1,
        pageSize: 10,
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
