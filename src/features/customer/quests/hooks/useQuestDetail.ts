import { useCallback, useEffect, useState } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { enrollInQuest, stopQuest } from '@slices/quests';

import type {
  QuestResponse,
  UserQuestProgress,
} from '@features/customer/quests/types/quest';

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
  refresh: () => Promise<void>;
} => {
  const dispatch = useAppDispatch();
  const [quest, setQuest] = useState<QuestResponse | null>(null);
  const [myProgress, setMyProgress] = useState<UserQuestProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [stopping, setStopping] = useState(false);
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
    setEnrolling(true);
    try {
      const result = await dispatch(enrollInQuest(questId)).unwrap();
      setMyProgress(result);
      return result;
    } finally {
      setEnrolling(false);
    }
  }, [dispatch, questId]);

  const handleStop = useCallback(async () => {
    setStopping(true);
    try {
      const result = await dispatch(stopQuest(questId)).unwrap();
      setMyProgress(result);
      return result;
    } finally {
      setStopping(false);
    }
  }, [dispatch, questId]);

  return {
    quest,
    myProgress,
    loading,
    enrolling,
    stopping,
    error,
    handleEnroll,
    handleStop,
    refresh: fetchDetail,
  };
};
