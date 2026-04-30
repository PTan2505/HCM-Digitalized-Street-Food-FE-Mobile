import { getLowcaAPIUnimplementedEndpoints } from '@features/customer/campaigns/api/generated';
import type { BranchCampaignInfo } from '@features/customer/campaigns/types/generated';
import { queryKeys } from '@lib/queryKeys';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

const STALE_TIME = 5 * 60 * 1000;

export const useVendorCampaignsByBranchIds = (
  branchIds: number[],
  isWorking?: boolean
): {
  campaignsByBranchId: Record<number, BranchCampaignInfo[]>;
  isLoading: boolean;
} => {
  const campaignApi = getLowcaAPIUnimplementedEndpoints();

  const results = useQueries({
    queries: branchIds.map((branchId) => ({
      queryKey: queryKeys.campaigns.vendorCampaignsByBranch(
        branchId,
        isWorking ?? null
      ),
      queryFn: (): Promise<BranchCampaignInfo[]> =>
        campaignApi.getVendorCampaignsByBranch(
          branchId,
          isWorking !== undefined ? { isWorking } : undefined
        ),
      staleTime: STALE_TIME,
    })),
  });

  const campaignsByBranchId = useMemo<
    Record<number, BranchCampaignInfo[]>
  >(() => {
    const map: Record<number, BranchCampaignInfo[]> = {};
    branchIds.forEach((branchId, i) => {
      const data = results[i]?.data;
      if (data && data.length > 0) map[branchId] = data;
    });
    return map;
  }, [branchIds, results]);

  const isLoading = results.some((r) => r.isLoading);

  return { campaignsByBranchId, isLoading };
};
