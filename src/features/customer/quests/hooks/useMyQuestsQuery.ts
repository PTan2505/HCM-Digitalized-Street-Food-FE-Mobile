import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import type { PaginatedUserQuests } from '@features/customer/quests/types/quest';

export const useMyQuestsQuery = (
  status?: string,
  isTierUp?: boolean,
  pageNumber = 1,
  pageSize = 10
): {
  data: PaginatedUserQuests | undefined;
  isLoading: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.quests.my(status),
    queryFn: () =>
      axiosApi.questApi.getMyQuests(status, isTierUp, pageNumber, pageSize),
    staleTime: 60 * 1000,
  });
  return { data, isLoading, refetch };
};
