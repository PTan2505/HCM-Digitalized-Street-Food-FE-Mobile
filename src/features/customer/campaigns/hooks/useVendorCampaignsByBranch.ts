import { getLowcaAPIUnimplementedEndpoints } from '@features/customer/campaigns/api/generated';
import type { BranchCampaignInfo } from '@features/customer/campaigns/types/generated';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

export const useVendorCampaignsByBranch = (
  branchId: number,
  isWorking?: boolean
): {
  campaigns: BranchCampaignInfo[];
  isLoading: boolean;
} => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.vendorCampaignsByBranch(
      branchId,
      isWorking ?? null
    ),
    queryFn: (): Promise<BranchCampaignInfo[]> =>
      campaignApi.getVendorCampaignsByBranch(
        branchId,
        isWorking !== undefined ? { isWorking } : undefined
      ),
    staleTime: 5 * 60 * 1000,
  });

  return { campaigns: data ?? [], isLoading };
};
