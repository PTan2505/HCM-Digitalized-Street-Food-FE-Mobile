import type { NotificationDto } from '@features/notifications/types/notification';
import { ORDER_STATUS } from '@features/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import * as signalR from '@microsoft/signalr';
import {
  addPoints,
  addXP,
  refreshUserBalanceThunk,
  selectUserXP,
} from '@slices/auth';
import { syncOrderToHistoryFromNotificationThunk } from '@slices/directOrdering';
import { receiveNotification } from '@slices/notifications';
import { fetchMyQuests, setPendingReward } from '@slices/quests';
import { showXPToast } from '@slices/xpToast';
import { tokenManagement } from '@utils/tokenManagement';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

const HUB_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '')}/hubs/notifications`;
const MAX_RETRY_DELAY_MS = 30_000;
const INITIAL_RETRY_DELAY_MS = 2_000;

export const useNotificationSocket = (isAuthenticated: boolean): void => {
  const dispatch = useAppDispatch();
  const currentXPRef = useRef(0);
  // Keep a ref so the SignalR callback always reads the latest XP without
  // needing to re-subscribe (the callback closure captures the ref, not state)
  const currentXP = useAppSelector(selectUserXP);
  currentXPRef.current = currentXP;

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => tokenManagement.getAccessToken(),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (notification: NotificationDto) => {
      dispatch(receiveNotification(notification));

      if (
        notification.type === 'OrderStatusUpdate' &&
        notification.referenceId
      ) {
        dispatch(
          syncOrderToHistoryFromNotificationThunk(notification.referenceId)
        )
          .unwrap()
          .then((order) => {
            if (order.status === ORDER_STATUS.Cancelled) {
              dispatch(refreshUserBalanceThunk());
            }
          })
          .catch(() => {});
      }

      const isQuestTaskCompleted =
        notification.type === 'QuestTaskCompleted' || notification.type === '3';
      const isQuestCompleted =
        notification.type === 'QuestCompleted' || notification.type === '4';

      if (
        (isQuestTaskCompleted || isQuestCompleted) &&
        notification.referenceId
      ) {
        const questTaskId = notification.referenceId;
        const previousXP = currentXPRef.current;

        // Apply XP immediately if the backend sent the amount
        if (notification.xpEarned && notification.xpEarned > 0) {
          const newXP = previousXP + notification.xpEarned;
          dispatch(addXP(notification.xpEarned));
          dispatch(
            showXPToast({
              xpEarned: notification.xpEarned,
              previousXP,
              newXP,
            })
          );
        }

        // Fetch task to get reward items, then show the reward modal.
        // 1 s delay so any currently-open modal (e.g. ReviewFormModal) can
        // dismiss before we present the quest reward card.
        axiosApi.questApi
          .getQuestTaskById(questTaskId)
          .then((task) => {
            // Update points balance immediately
            const pointsReward = task.rewards.find(
              (r) => r.rewardType === 'POINTS'
            );
            if (pointsReward) {
              dispatch(
                addPoints(pointsReward.rewardValue * pointsReward.quantity)
              );
            }

            // Show reward modal — QuestCompleted always shows it; QuestTaskCompleted
            // shows it only when there are rewards to display
            const shouldShowModal = isQuestCompleted || task.rewards.length > 0;
            if (shouldShowModal) {
              setTimeout(() => {
                dispatch(
                  setPendingReward({
                    rewards: task.rewards,
                    xpEarned: notification.xpEarned,
                  })
                );
              }, 1000);
            }
          })
          .catch(() => {});

        // Refresh quest list in background
        dispatch(fetchMyQuests({ isTierUp: isQuestCompleted }));
      }
    });

    connectionRef.current = connection;

    // Retry with exponential backoff on initial connection failure.
    // withAutomaticReconnect() only handles drops after a successful connection.
    const scheduleRetry = (delay: number): void => {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connect(delay);
      }, delay);
    };

    const connect = (nextRetryDelay = INITIAL_RETRY_DELAY_MS): void => {
      if (cancelled) return;
      if (connection.state !== signalR.HubConnectionState.Disconnected) return;
      connection.start().catch(() => {
        if (cancelled) return;
        scheduleRetry(Math.min(nextRetryDelay * 2, MAX_RETRY_DELAY_MS));
      });
    };

    const disconnect = (): void => {
      if (retryTimeout !== null) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
      if (
        connection.state === signalR.HubConnectionState.Disconnected ||
        connection.state === signalR.HubConnectionState.Connecting
      )
        return;
      connection.stop().catch(() => {});
    };

    connect();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (cancelled) return;
      if (nextState === 'active') {
        connect();
        return;
      }
      // 'inactive' is a transient iOS state (phone call, Control Center, etc.)
      // — do not disconnect, it will settle back to 'active' shortly.
      if (nextState === 'background') {
        disconnect();
      }
    });

    return (): void => {
      cancelled = true;
      subscription.remove();
      disconnect();
      connectionRef.current = null;
    };
  }, [isAuthenticated, dispatch]);
};
