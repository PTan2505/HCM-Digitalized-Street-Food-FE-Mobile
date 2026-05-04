import { getLowcaAPIUnimplementedEndpoints } from '@features/customer/campaigns/api/generated';
import type { VendorCampaignBranch } from '@features/customer/campaigns/types/generated';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

export const useVendorCampaignBranches = (
  coords?: { latitude: number; longitude: number } | null,
  permissionStatus?: Location.PermissionStatus,
  coordsSettled?: boolean
): {
  branches: VendorCampaignBranch[];
  imageMap: Record<number, string>;
  multiBranchVendorIds: number[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} => {
  const lat = coords?.latitude ?? null;
  const lng = coords?.longitude ?? null;

  // Don't fetch until permission is settled and, when GRANTED, until the
  // coords fetch has completed (success or failure) — otherwise we'd fire once
  // with lat/lng null then again when the async location fetch resolves.
  const enabled =
    permissionStatus === undefined ||
    (permissionStatus !== Location.PermissionStatus.UNDETERMINED &&
      permissionStatus !== Location.PermissionStatus.GRANTED) ||
    (permissionStatus === Location.PermissionStatus.GRANTED &&
      (coordsSettled ?? coords !== null));

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.campaigns.vendorBranches(lat, lng),
    enabled,
    queryFn: async () => {
      const result = await campaignApi.getVendorCampaignBranches({
        pageNumber: 1,
        pageSize: 10,
        lat,
        lng,
        distance: coords ? 20 : undefined,
      });

      const items = result?.items ?? [];

      const uniqueVendorIds = [...new Set(items.map((b) => b.vendorId))];

      const [vendorChecks, imageResults] = await Promise.all([
        Promise.all(
          uniqueVendorIds.map((vendorId) =>
            axiosApi.branchApi
              .getBranchesByVendor(vendorId, 1, 2)
              .then((res) => ({ vendorId, totalCount: res.totalCount }))
              .catch(() => ({ vendorId, totalCount: 1 }))
          )
        ),
        Promise.all(
          items.map((branch) =>
            axiosApi.branchApi
              .getBranchImages(branch.branchId, 1, 1)
              .then((res) => ({
                branchId: branch.branchId,
                imageUrl: res.items[0]?.imageUrl ?? null,
              }))
              .catch(() => ({ branchId: branch.branchId, imageUrl: null }))
          )
        ),
      ]);

      const multiBranchVendorIds = vendorChecks
        .filter((v) => v.totalCount > 1)
        .map((v) => v.vendorId);

      const imageMap: Record<number, string> = Object.fromEntries(
        imageResults
          .filter(
            (r): r is { branchId: number; imageUrl: string } =>
              r.imageUrl !== null
          )
          .map((r) => [r.branchId, r.imageUrl])
      );

      return { items, imageMap, multiBranchVendorIds };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    branches: data?.items ?? [],
    imageMap: data?.imageMap ?? {},
    multiBranchVendorIds: data?.multiBranchVendorIds ?? [],
    isLoading,
    isError,
    refetch,
  };
};
