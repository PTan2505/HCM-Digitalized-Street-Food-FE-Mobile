import type {
  SystemCampaign,
  JoinSystemCampaignRequest,
} from '@manager/campaigns/api/managerCampaignApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

export const useSystemCampaigns = (): UseQueryResult<SystemCampaign[]> =>
  useQuery({
    queryKey: queryKeys.managerCampaigns.systemJoinable(),
    queryFn: () => axiosApi.managerCampaignApi.getSystemJoinableCampaigns(),
  });

export const useSystemCampaignDetail = (
  id: number
): UseQueryResult<SystemCampaign> =>
  useQuery({
    queryKey: queryKeys.managerCampaigns.systemDetail(id),
    queryFn: () => axiosApi.managerCampaignApi.getSystemCampaignById(id),
    enabled: id > 0,
  });

export const useJoinSystemCampaign = (
  campaignId: number
): UseMutationResult<void, Error, JoinSystemCampaignRequest> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      axiosApi.managerCampaignApi.joinSystemCampaign(campaignId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.systemJoinable(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.systemDetail(campaignId),
      });
    },
  });
};
