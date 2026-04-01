import type { NotificationDto } from '@features/notifications/types/notification';
import { useAppDispatch } from '@hooks/reduxHooks';
import * as signalR from '@microsoft/signalr';
import { receiveNotification } from '@slices/notifications';
import { tokenManagement } from '@utils/tokenManagement';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

const HUB_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '')}/hubs/notifications`;

export const useNotificationSocket = (isAuthenticated: boolean): void => {
  const dispatch = useAppDispatch();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const startConnection = (connection: signalR.HubConnection): void => {
    if (connection.state !== signalR.HubConnectionState.Disconnected) return;
    connection.start().catch(() => {});
  };

  const stopConnection = (connection: signalR.HubConnection): void => {
    if (connection.state === signalR.HubConnectionState.Disconnected) return;
    connection.stop().catch(() => {});
  };

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

      startConnection(connection);

      return connection;
    };

    connectionRef.current = buildAndStart();

    const subscription = AppState.addEventListener('change', (nextState) => {
      const conn = connectionRef.current;
      if (!conn) return;
      if (nextState === 'active') {
        startConnection(conn);
        return;
      }

      stopConnection(conn);
    });

    return (): void => {
      subscription.remove();
      const conn = connectionRef.current;
      if (conn) stopConnection(conn);
      connectionRef.current = null;
    };
  }, [isAuthenticated, dispatch]);
};
