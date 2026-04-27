import type {
  QuestResponse,
  UserQuestProgress,
} from '@features/customer/quests/types/quest';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useQuestDetail = (
  questId: number
): {
  quest: QuestResponse | null;
  myProgress: UserQuestProgress | null;
  loading: boolean;
  enrolling: boolean;
  stopping: boolean;
  error: string | null;
  handleEnroll: () => Promise<UserQuestProgress>;
  handleStop: () => Promise<UserQuestProgress>;
  refresh: () => Promise<unknown>;
} => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.quests.detail(questId),
    queryFn: async () => {
      const [questData, myQuests] = await Promise.all([
        axiosApi.questApi.getQuestById(questId),
        axiosApi.questApi.getMyQuests(),
      ]);
      const myProgress =
        myQuests.items.find((q: UserQuestProgress) => q.questId === questId) ??
        null;
      return { quest: questData, myProgress };
    },
    staleTime: 60 * 1000,
  });

  const invalidate = (): void => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.quests.detail(questId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.quests.my() });
  };

  const { mutateAsync: enroll, isPending: enrolling } = useMutation({
    mutationFn: () => axiosApi.questApi.enrollInQuest(questId),
    onSuccess: invalidate,
  });

  const { mutateAsync: stop, isPending: stopping } = useMutation({
    mutationFn: () => axiosApi.questApi.stopQuest(questId),
    onSuccess: invalidate,
  });

  return {
    quest: data?.quest ?? null,
    myProgress: data?.myProgress ?? null,
    loading,
    enrolling,
    stopping,
    error: error ? (error.message ?? String(error)) : null,
    handleEnroll: enroll,
    handleStop: stop,
    refresh: refetch,
  };
};
