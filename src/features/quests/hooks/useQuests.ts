import { useCallback, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  fetchMyQuests,
  fetchPublicQuests,
  selectMyQuests,
  selectPublicQuests,
  selectQuestsError,
  selectQuestsLoading,
} from '@slices/quests';

export const useQuests = (): {
  publicQuests: import('@features/quests/types/quest').PaginatedQuests | null;
  myQuests: import('@features/quests/types/quest').UserQuestProgress[];
  loading: boolean;
  error: string | null;
  loadPublicQuests: (pageNumber?: number, pageSize?: number) => void;
  loadMyQuests: (status?: string) => void;
} => {
  const dispatch = useAppDispatch();
  const publicQuests = useAppSelector(selectPublicQuests);
  const myQuests = useAppSelector(selectMyQuests);
  const loading = useAppSelector(selectQuestsLoading);
  const error = useAppSelector(selectQuestsError);

  const loadPublicQuests = useCallback(
    (pageNumber = 1, pageSize = 10) => {
      void dispatch(fetchPublicQuests({ pageNumber, pageSize }));
    },
    [dispatch]
  );

  const loadMyQuests = useCallback(
    (status?: string) => {
      void dispatch(fetchMyQuests(status));
    },
    [dispatch]
  );

  useEffect(() => {
    loadPublicQuests();
    loadMyQuests();
  }, [loadPublicQuests, loadMyQuests]);

  return {
    publicQuests,
    myQuests,
    loading,
    error,
    loadPublicQuests,
    loadMyQuests,
  };
};
