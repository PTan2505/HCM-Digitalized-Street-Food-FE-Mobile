import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAppDispatch } from '@hooks/reduxHooks';
import { tokenManagement } from '@utils/tokenManagement';
import { receiveNotification } from '@slices/notifications';
import type { NotificationDto } from '@features/notifications/types/notification';

const HUB_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '')}/hubs/notifications`;

export const useNotificationSocket = (isAuthenticated: boolean): void => {
  const dispatch = useAppDispatch();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const buildAndStart = (): signalR.HubConnection => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => tokenManagement.getAccessToken(),
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on('ReceiveNotification', (notification: NotificationDto) => {
        dispatch(receiveNotification(notification));
      });

      connection.start().catch(() => {});

      return connection;
    };

    connectionRef.current = buildAndStart();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      const conn = connectionRef.current;
      if (conn?.state === signalR.HubConnectionState.Disconnected) {
        conn.start().catch(() => {});
      }
    });

    return (): void => {
      subscription.remove();
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
  }, [isAuthenticated, dispatch]);
};
