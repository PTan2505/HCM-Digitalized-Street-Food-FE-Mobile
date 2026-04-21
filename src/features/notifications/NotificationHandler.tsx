import { QuestRewardModal } from '@features/customer/quests/components/QuestRewardModal';
import { useNotificationNavigation } from '@features/notifications/hooks/useNotificationNavigation';
import { useNotifications } from '@features/notifications/hooks/useNotifications';
import { useNotificationSocket } from '@features/notifications/hooks/useNotificationSocket';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { selectUser } from '@slices/auth';
import {
  clearPendingReward,
  selectPendingReward,
  setPendingReward,
} from '@slices/quests';
import type { JSX } from 'react';
import { useEffect } from 'react';

/**
 * Invisible component that initializes push notifications and handles
 * navigation when the user taps a notification.
 *
 * Must be rendered inside the Redux Provider. Uses navigationRef for
 * imperative navigation (no NavigationContainer ancestor required).
 */
export const NotificationHandler = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = !!user;
  const pendingReward = useAppSelector(selectPendingReward);

  const { lastResponse } = useNotifications(isAuthenticated);
  useNotificationNavigation(lastResponse, isAuthenticated);
  useNotificationSocket(isAuthenticated);

  // Handle tier-up quest complete notification: fetch task rewards and show modal
  useEffect(() => {
    if (!lastResponse) return;
    const data = lastResponse.notification.request.content.data as Record<
      string,
      unknown
    >;
    if (data.type !== 'tier_up_quest_complete') return;
    const questTaskId = data.questTaskId as number | undefined;
    if (!questTaskId) return;

    axiosApi.questApi
      .getQuestTaskById(questTaskId)
      .then((task) => {
        if (task.rewards.length > 0) {
          dispatch(setPendingReward({ rewards: task.rewards }));
        }
      })
      .catch(() => {});
  }, [lastResponse, dispatch]);

  const handleDismiss = (): void => {
    dispatch(clearPendingReward());
  };

  return (
    <QuestRewardModal
      visible={pendingReward !== null}
      rewards={pendingReward?.rewards ?? []}
      onDismiss={handleDismiss}
    />
  );
};
