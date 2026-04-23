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
  publicQuests: ReturnType<typeof selectPublicQuests>;
  myQuests: ReturnType<typeof selectMyQuests>;
  loading: boolean;
  error: string | null;
  loadPublicQuests: (
    pageNumber?: number,
    pageSize?: number,
    isStandalone?: boolean,
    isTierUp?: boolean
  ) => void;
  loadMyQuests: (
    status?: string,
    isTierUp?: boolean,
    pageNumber?: number,
    pageSize?: number
  ) => void;
} => {
  const dispatch = useAppDispatch();
  const publicQuests = useAppSelector(selectPublicQuests);
  const myQuests = useAppSelector(selectMyQuests);
  const loading = useAppSelector(selectQuestsLoading);
  const error = useAppSelector(selectQuestsError);

  const loadPublicQuests = useCallback(
    (
      pageNumber = 1,
      pageSize = 10,
      isStandalone?: boolean,
      isTierUp?: boolean
    ) => {
      void dispatch(
        fetchPublicQuests({ pageNumber, pageSize, isStandalone, isTierUp })
      );
    },
    [dispatch]
  );

  const loadMyQuests = useCallback(
    (status?: string, isTierUp?: boolean, pageNumber = 1, pageSize = 10) => {
      void dispatch(fetchMyQuests({ status, isTierUp, pageNumber, pageSize }));
    },
    [dispatch]
  );

  useEffect(() => {
    loadPublicQuests(1, 10, true);
    loadMyQuests(undefined, false);
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
