import { getLowcaAPIUnimplementedEndpoints } from '@features/campaigns/api/generated';
import type { QuestResponse } from '@features/campaigns/types/generated';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const questApi = getLowcaAPIUnimplementedEndpoints();

export const useCampaignQuests = (
  campaignId: string
): {
  quests: QuestResponse[];
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: quests = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.quests.byCampaign(campaignId),
    queryFn: async () => {
      const data = await questApi.getPublicQuests({
        campaignId: Number(campaignId),
        pageNumber: 1,
        pageSize: 10,
      });
      return data?.items ?? [];
    },
    enabled: !!campaignId,
  });

  return { quests, isLoading, isError };
};
