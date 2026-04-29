import type { CampaignVoucherDto } from '@features/customer/campaigns/api/voucherApi';
import type { RestaurantCampaign } from '@features/customer/campaigns/types/generated';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useRestaurantCampaigns = (
  campaignId: string
): {
  campaign: RestaurantCampaign | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} => {
  const {
    data: campaign = null,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.campaigns.restaurant(Number(campaignId)),
    queryFn: async () => {
      const campaign = await axiosApi.questApi.getCampaignById(
        Number(campaignId)
      );
      return campaign;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { campaign, isLoading, isError, refetch };
};

export const useCampaignVouchers = (
  campaignId: string
): {
  vouchers: CampaignVoucherDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
} => {
  const {
    data: vouchers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.vouchers.campaignVoucher(Number(campaignId)),
    queryFn: () => axiosApi.voucherApi.getCampaignVouchers(Number(campaignId)),
    staleTime: 5 * 60 * 1000,
  });

  return { vouchers, isLoading, isError, refetch };
};
