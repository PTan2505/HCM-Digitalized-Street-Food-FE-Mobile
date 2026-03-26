import type { NearbyCampaign } from '@features/campaigns/types/generated';
import { getLowcaAPIUnimplementedEndpoints } from '@features/campaigns/api/generated';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

export const useNearbyCampaigns = (
  coords?: { latitude: number; longitude: number } | null
): {
  nearbyCampaigns: NearbyCampaign[];
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: nearbyCampaigns = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.campaigns.nearby(
      coords?.latitude ?? 0,
      coords?.longitude ?? 0
    ),
    queryFn: async () => {
      const data = await campaignApi.getNearbyCampaigns({
        lat: coords!.latitude,
        lng: coords!.longitude,
      });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!coords,
  });

  return { nearbyCampaigns, isLoading, isError };
};
