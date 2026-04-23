import { getLowcaAPIUnimplementedEndpoints } from '@features/customer/campaigns/api/generated';
import type { QuestResponse } from '@features/customer/campaigns/types/generated';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const questApi = getLowcaAPIUnimplementedEndpoints();

export const useCampaignQuest = (
  campaignId: string
): {
  quest: QuestResponse | null;
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: quest = null,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.quests.byCampaign(campaignId),
    queryFn: async () => {
      const data = await questApi.getPublicQuests({
        campaignId: Number(campaignId),
        pageNumber: 1,
        pageSize: 1,
      });
      return data?.items?.[0] ?? null;
    },
    enabled: !!campaignId,
  });

  return { quest, isLoading, isError };
};
