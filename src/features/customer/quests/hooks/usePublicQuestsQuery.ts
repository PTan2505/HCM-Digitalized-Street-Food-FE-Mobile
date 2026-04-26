import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import type { PaginatedQuests } from '@features/customer/quests/types/quest';

export const usePublicQuestsQuery = (
  pageNumber = 1,
  pageSize = 10,
  isStandalone?: boolean,
  isTierUp?: boolean
): {
  data: PaginatedQuests | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  return useQuery({
    queryKey: queryKeys.quests.public,
    queryFn: () =>
      axiosApi.questApi.getPublicQuests(
        pageNumber,
        pageSize,
        isStandalone,
        isTierUp
      ),
    staleTime: 5 * 60 * 1000,
  });
};
