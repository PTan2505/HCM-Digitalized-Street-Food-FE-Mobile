import type { SystemCampaign } from '@features/campaigns/types/generated';
import { getLowcaAPIUnimplementedEndpoints } from '@features/campaigns/api/generated';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

export const useSystemCampaigns = (): {
  systemCampaigns: SystemCampaign[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} => {
  const {
    data: systemCampaigns = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.campaigns.system,
    queryFn: async () => {
      const data = await campaignApi.getSystemCampaigns({ page: 1, pageSize: 10 });
      return data?.items ?? [];
    },
  });

  return { systemCampaigns, isLoading, isError, refetch };
};
