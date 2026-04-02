import * as signalR from '@microsoft/signalr';
import { tokenManagement } from '@utils/tokenManagement';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export type PaymentSocketStatus = 'PAID' | 'CANCELLED' | 'EXPIRED' | null;

interface PaymentStatusPayload {
  orderCode: number;
  status: string;
  orderId: number | null;
}

const HUB_URL = `${process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '')}/hubs/notifications`;

export const usePaymentSocket = (
  orderCode: number | null
): { paymentStatus: PaymentSocketStatus } => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentSocketStatus>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const orderCodeRef = useRef<number | null>(orderCode);

  const startConnection = (connection: signalR.HubConnection): void => {
    if (connection.state !== signalR.HubConnectionState.Disconnected) return;
    connection.start().catch(() => {
      // Silent — OrderStatus polling is the fallback
    });
  };

  const stopConnection = (connection: signalR.HubConnection): void => {
    if (connection.state === signalR.HubConnectionState.Disconnected) return;
    connection.stop().catch(() => {
      // Silent — connection may already be in transition
    });
  };

  useEffect(() => {
    orderCodeRef.current = orderCode;
  }, [orderCode]);

  useEffect(() => {
    if (!orderCode) return;

    const buildAndStart = (): signalR.HubConnection => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => tokenManagement.getAccessToken(),
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on('PaymentStatusUpdate', (payload: PaymentStatusPayload) => {
        if (payload.orderCode !== orderCodeRef.current) return;
        const status = payload.status.toUpperCase();
        if (
          status === 'PAID' ||
          status === 'CANCELLED' ||
          status === 'EXPIRED'
        ) {
          setPaymentStatus(status as PaymentSocketStatus);
        }
      });

      startConnection(connection);

      return connection;
    };

    connectionRef.current = buildAndStart();

    // When app returns from background (e.g. banking app), reconnect if disconnected
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
  }, [orderCode]);

  return { paymentStatus };
};
