import * as signalR from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { tokenManagement } from '@utils/tokenManagement';

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

      connection.start().catch(() => {
        // Silent — OrderStatus polling is the fallback
      });

      return connection;
    };

    connectionRef.current = buildAndStart();

    // When app returns from background (e.g. banking app), reconnect if disconnected
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
  }, [orderCode]);

  return { paymentStatus };
};
