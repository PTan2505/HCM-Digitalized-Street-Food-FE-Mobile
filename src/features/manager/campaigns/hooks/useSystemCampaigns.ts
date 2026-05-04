import type {
  CampaignBranchesResponse,
  CampaignBranchItem,
  JoinSystemCampaignRequest,
  PaginatedCampaignBranches,
  PaginatedSystemCampaigns,
  SystemCampaign,
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

export const useSystemCampaigns =
  (): UseQueryResult<PaginatedSystemCampaigns> =>
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

export const useCampaignBranches = (
  campaignId: number,
  isSystemCampaign: boolean | undefined
): UseQueryResult<PaginatedCampaignBranches> =>
  useQuery({
    queryKey: queryKeys.managerCampaigns.branches(
      campaignId,
      isSystemCampaign ?? false
    ),
    queryFn: () =>
      isSystemCampaign
        ? axiosApi.managerCampaignApi.getSystemCampaignBranches(campaignId)
        : axiosApi.managerCampaignApi.getCampaignBranches(campaignId),
    enabled: campaignId > 0 && isSystemCampaign !== undefined,
  });

export const useAddBranchesToCampaign = (
  campaignId: number
): UseMutationResult<CampaignBranchesResponse, Error, number[]> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchIds) =>
      axiosApi.managerCampaignApi.addBranchesToCampaign(campaignId, branchIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.branches(campaignId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.detail(campaignId),
      });
    },
  });
};

export const useRemoveBranchesFromCampaign = (
  campaignId: number
): UseMutationResult<CampaignBranchesResponse, Error, number[]> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchIds) =>
      axiosApi.managerCampaignApi.removeBranchesFromCampaign(
        campaignId,
        branchIds
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.branches(campaignId),
      });
    },
  });
};

// Re-export types for consumers
export type { CampaignBranchItem };
