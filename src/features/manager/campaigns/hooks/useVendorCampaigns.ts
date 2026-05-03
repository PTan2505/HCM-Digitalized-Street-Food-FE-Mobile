import type {
  VendorCampaign,
  PaginatedVendorCampaigns,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from '@manager/campaigns/api/managerCampaignApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

interface VendorCampaignsListResult {
  items: VendorCampaign[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasNext: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export const useVendorCampaignsList = (): VendorCampaignsListResult => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.managerCampaigns.vendorList(),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      axiosApi.managerCampaignApi.getVendorCampaigns(pageParam, 10),
    getNextPageParam: (lastPage: PaginatedVendorCampaigns) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  return {
    items: query.data?.pages.flatMap((p) => p.items) ?? [],
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isLoadingMore: query.isFetchingNextPage,
    hasNext: query.hasNextPage ?? false,
    loadMore: () => void query.fetchNextPage(),
    refresh: () => void query.refetch(),
  };
};

export const useVendorCampaignDetail = (
  id: number
): UseQueryResult<VendorCampaign> =>
  useQuery({
    queryKey: queryKeys.managerCampaigns.detail(id),
    queryFn: () => axiosApi.managerCampaignApi.getCampaignById(id),
    enabled: id > 0,
  });

export const useCreateVendorCampaign = (): UseMutationResult<
  VendorCampaign,
  Error,
  CreateCampaignRequest
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosApi.managerCampaignApi.createCampaign(data),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.vendorList(),
      }),
  });
};

export const useUpdateVendorCampaign = (
  id: number
): UseMutationResult<VendorCampaign, Error, UpdateCampaignRequest> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosApi.managerCampaignApi.updateCampaign(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.vendorList(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.detail(id),
      });
    },
  });
};
