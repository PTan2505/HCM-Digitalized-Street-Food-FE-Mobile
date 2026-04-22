import type { RestaurantCampaign } from '@features/customer/campaigns/types/generated';
import { getLowcaAPIUnimplementedEndpoints } from '@features/customer/campaigns/api/generated';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

export const useRestaurantCampaigns = (
  coords?: { latitude: number; longitude: number } | null
): {
  restaurantCampaigns: RestaurantCampaign[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} => {
  const {
    data: restaurantCampaigns = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.campaigns.restaurant(
      coords?.latitude,
      coords?.longitude
    ),
    queryFn: async () => {
      const data = await campaignApi.getPublicCampaigns({
        isSystem: false,
        ...(coords ? { lat: coords.latitude, lng: coords.longitude } : {}),
      });
      return data?.items ?? [];
    },
  });

  return { restaurantCampaigns, isLoading, isError, refetch };
};
