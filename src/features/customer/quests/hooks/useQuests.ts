import { useMyQuestsQuery } from '@features/customer/quests/hooks/useMyQuestsQuery';
import { usePublicQuestsQuery } from '@features/customer/quests/hooks/usePublicQuestsQuery';
import type {
  PaginatedQuests,
  PaginatedUserQuests,
} from '@features/customer/quests/types/quest';

export const useQuests = (): {
  publicQuests: PaginatedQuests | undefined;
  myQuests: PaginatedUserQuests | undefined;
  loading: boolean;
  loadPublicQuests: () => void;
  loadMyQuests: () => void;
} => {
  const {
    data: publicQuests,
    isLoading: publicLoading,
    refetch: refetchPublic,
  } = usePublicQuestsQuery(1, 10, true);
  const {
    data: myQuests,
    isLoading: myLoading,
    refetch: refetchMy,
  } = useMyQuestsQuery(undefined, false);

  return {
    publicQuests,
    myQuests,
    loading: publicLoading || myLoading,
    loadPublicQuests: refetchPublic,
    loadMyQuests: refetchMy,
  };
};
