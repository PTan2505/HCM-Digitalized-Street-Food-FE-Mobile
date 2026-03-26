import { getLowcaAPIUnimplementedEndpoints } from '@features/campaigns/api/generated';
import type { UserQuestProgress } from '@features/campaigns/types/generated';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const questApi = getLowcaAPIUnimplementedEndpoints();

export const useCampaignQuestProgress = (
  campaignId: string
): {
  progressList: UserQuestProgress[];
  isLoading: boolean;
  isError: boolean;
  enroll: (questId: number) => void;
  isEnrolling: boolean;
} => {
  const queryClient = useQueryClient();

  const {
    data: progressList = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.quests.myProgress(campaignId),
    queryFn: () => questApi.getCampaignQuestProgress(campaignId),
    enabled: !!campaignId,
  });

  const { mutate: enroll, isPending: isEnrolling } = useMutation({
    mutationFn: (questId: number) => questApi.enrollInQuest(questId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.quests.myProgress(campaignId),
      });
    },
  });

  return { progressList, isLoading, isError, enroll, isEnrolling };
};
