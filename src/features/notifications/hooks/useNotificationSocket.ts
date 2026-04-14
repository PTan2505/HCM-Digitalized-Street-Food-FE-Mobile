import type { NotificationDto } from '@features/notifications/types/notification';
import { ORDER_STATUS } from '@features/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { useAppDispatch } from '@hooks/reduxHooks';
import * as signalR from '@microsoft/signalr';
import { addPoints, refreshUserBalanceThunk } from '@slices/auth';
import { syncOrderToHistoryFromNotificationThunk } from '@slices/directOrdering';
import { receiveNotification } from '@slices/notifications';
import { fetchMyQuests, setPendingReward } from '@slices/quests';
import { tokenManagement } from '@utils/tokenManagement';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

const HUB_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '')}/hubs/notifications`;
const MAX_RETRY_DELAY_MS = 30_000;
const INITIAL_RETRY_DELAY_MS = 2_000;

export const useNotificationSocket = (isAuthenticated: boolean): void => {
  const dispatch = useAppDispatch();
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

      if (isQuestTaskCompleted && notification.referenceId) {
        const questTaskId = notification.referenceId;

        // Fetch the task definition to get reward info, then show modal.
        // Delay showing the modal by 1 s so any currently-open modal (e.g. the
        // ReviewFormModal) has time to dismiss before we present the reward card.
        axiosApi.questApi
          .getQuestTaskById(questTaskId)
          .then((task) => {
            // POINTS — update user balance immediately (no need to wait)
            const pointsReward = task.rewards.find(
              (r) => r.rewardType === 'POINTS'
            );
            if (pointsReward) {
              dispatch(
                addPoints(pointsReward.rewardValue * pointsReward.quantity)
              );
            }

            if (task.rewards.length > 0) {
              setTimeout(() => {
                dispatch(setPendingReward({ rewards: task.rewards }));
              }, 1000);
            }
          })
          .catch(() => {});

        // Refresh quest list in background so screens stay up-to-date
        dispatch(fetchMyQuests({ isTierUp: false }));
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
