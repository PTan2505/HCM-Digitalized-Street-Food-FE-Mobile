import { useCallback, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { enrollInQuest, selectQuestsLoading } from '@slices/quests';

import type {
  QuestResponse,
  UserQuestProgress,
} from '@features/quests/types/quest';

export const useQuestDetail = (
  questId: number
): {
  quest: QuestResponse | null;
  myProgress: UserQuestProgress | null;
  loading: boolean;
  enrolling: boolean;
  error: string | null;
  handleEnroll: () => Promise<UserQuestProgress>;
  refresh: () => Promise<void>;
} => {
  const dispatch = useAppDispatch();
  const enrolling = useAppSelector(selectQuestsLoading);
  const [quest, setQuest] = useState<QuestResponse | null>(null);
  const [myProgress, setMyProgress] = useState<UserQuestProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [questData, myQuests] = await Promise.all([
        axiosApi.questApi.getQuestById(questId),
        axiosApi.questApi.getMyQuests(),
      ]);
      setQuest(questData);
      const enrolled =
        myQuests.items.find((q: UserQuestProgress) => q.questId === questId) ??
        null;
      setMyProgress(enrolled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quest');
    } finally {
      setLoading(false);
    }
  }, [questId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const handleEnroll = useCallback(async () => {
    const result = await dispatch(enrollInQuest(questId)).unwrap();
    setMyProgress(result);
    return result;
  }, [dispatch, questId]);

  return {
    quest,
    myProgress,
    loading,
    enrolling,
    error,
    handleEnroll,
    refresh: fetchDetail,
  };
};
