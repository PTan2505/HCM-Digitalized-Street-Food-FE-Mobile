import type { SystemCampaign } from '@features/campaigns/types/generated';
import { getLowcaAPIUnimplementedEndpoints } from '@features/campaigns/api/generated';
import { queryKeys } from '@lib/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

export const useSystemCampaigns = (): {
  systemCampaigns: SystemCampaign[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
} => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.campaigns.system,
    queryFn: async ({ pageParam }) => {
      return await campaignApi.getRestaurantCampaigns({
        isSystem: true,
        page: pageParam,
        pageSize: 10,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.hasNext ? (lastPage.currentPage ?? 1) + 1 : undefined,
  });

  const systemCampaigns: SystemCampaign[] =
    data?.pages.flatMap((page) =>
      (page?.items ?? []).map((item) => ({
        ...item,
        imageUrl: item.imageUrl ?? undefined,
      }))
    ) ?? [];

  return {
    systemCampaigns,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};
