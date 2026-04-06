import type { NotificationDto } from '@features/notifications/types/notification';
import { useAppDispatch } from '@hooks/reduxHooks';
import * as signalR from '@microsoft/signalr';
import { syncOrderToHistoryFromNotificationThunk } from '@slices/directOrdering';
import { receiveNotification } from '@slices/notifications';
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
        );
      }
    });

    connectionRef.current = connection;

    // Retry with exponential backoff on initial connection failure.
    // withAutomaticReconnect() only handles drops after a successful connection.
    const scheduleRetry = (delay: number): void => {
      console.log(`[NotificationSocket] Retrying in ${delay}ms...`);
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connect(delay);
      }, delay);
    };

    const connect = (nextRetryDelay = INITIAL_RETRY_DELAY_MS): void => {
      if (cancelled) return;
      if (connection.state !== signalR.HubConnectionState.Disconnected) return;
      console.log('[NotificationSocket] Connecting...');
      connection
        .start()
        .then(() => {
          console.log('[NotificationSocket] Connected');
        })
        .catch((err: unknown) => {
          console.warn('[NotificationSocket] Connection failed:', err);
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
      console.log('[NotificationSocket] Disconnecting...');
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
