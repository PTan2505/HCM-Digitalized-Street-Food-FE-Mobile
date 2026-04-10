import { useNotificationNavigation } from '@features/notifications/hooks/useNotificationNavigation';
import { useNotifications } from '@features/notifications/hooks/useNotifications';
import { useNotificationSocket } from '@features/notifications/hooks/useNotificationSocket';
import { QuestRewardModal } from '@features/quests/components/QuestRewardModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { clearPendingReward, selectPendingReward } from '@slices/quests';
import type { JSX } from 'react';

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

  const handleDismiss = (): void => {
    dispatch(clearPendingReward());
  };

  return (
    <QuestRewardModal
      visible={pendingReward !== null}
      rewardType={pendingReward?.rewardType ?? 'POINTS'}
      rewardValue={pendingReward?.rewardValue ?? 0}
      onDismiss={handleDismiss}
    />
  );
};
