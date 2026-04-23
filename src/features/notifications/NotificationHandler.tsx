import { ROLES } from '@constants/roles';
import { QuestRewardModal } from '@features/customer/quests/components/QuestRewardModal';
import { useNotificationNavigation } from '@features/notifications/hooks/useNotificationNavigation';
import { useNotifications } from '@features/notifications/hooks/useNotifications';
import { useNotificationSocket } from '@features/notifications/hooks/useNotificationSocket';
import { XPProgressToast } from '@features/xp/components/XPProgressToast';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { addXP, selectUser } from '@slices/auth';
import {
  clearPendingReward,
  selectPendingReward,
  setPendingReward,
} from '@slices/quests';
import { isManagerApp } from '@utils/appVariant';
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
  const expectedRole = isManagerApp ? ROLES.MANAGER : ROLES.CUSTOMER;
  const isAuthenticated = !!user && user.role === expectedRole;
  const pendingReward = useAppSelector(selectPendingReward);

  const { lastResponse, notification } = useNotifications(isAuthenticated);
  useNotificationNavigation(lastResponse, isAuthenticated);
  useNotificationSocket(isAuthenticated);

  const handleQuestPushData = (
    data: Record<string, unknown>,
    source: string
  ): void => {
    if (
      data.type !== 'tier_up_quest_complete' &&
      data.type !== 'quest_task_complete'
    ) {
      return;
    }
    const questTaskId = data.questTaskId as number | undefined;
    if (!questTaskId) return;

    // Apply XP immediately so XP bar and tier badge update before modal opens
    const xpEarned =
      typeof data.xpEarned === 'number' ? data.xpEarned : undefined;
    if (xpEarned && xpEarned > 0) {
      dispatch(addXP(xpEarned));
    }

    axiosApi.questApi
      .getQuestTaskById(questTaskId)
      .then((task) => {
        if (task.rewards.length > 0 || xpEarned) {
          dispatch(setPendingReward({ rewards: task.rewards, xpEarned }));
        }
      })
      .catch((err) => {
        console.error(
          `[QuestDebug][Push:${source}] getQuestTaskById FAILED:`,
          err
        );
      });
  };

  // Push arrived while app is in foreground (no tap required)
  useEffect(() => {
    if (!notification) return;
    const data = notification.request.content.data as Record<string, unknown>;
    handleQuestPushData(data, 'foreground');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification]);

  // Push tapped from background / notification tray
  useEffect(() => {
    if (!lastResponse) return;
    const data = lastResponse.notification.request.content.data as Record<
      string,
      unknown
    >;
    handleQuestPushData(data, 'tap');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse]);

  const handleDismiss = (): void => {
    dispatch(clearPendingReward());
  };

  return (
    <>
      <XPProgressToast />
      <QuestRewardModal
        visible={pendingReward !== null}
        rewards={pendingReward?.rewards ?? []}
        xpEarned={pendingReward?.xpEarned}
        onDismiss={handleDismiss}
      />
    </>
  );
};
