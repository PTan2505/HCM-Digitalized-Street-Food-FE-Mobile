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
const MAX_RETRY_DELAY_MS = 30_000;
const INITIAL_RETRY_DELAY_MS = 2_000;

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

    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

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
      if (status === 'PAID' || status === 'CANCELLED' || status === 'EXPIRED') {
        setPaymentStatus(status as PaymentSocketStatus);
      }
    });

    connectionRef.current = connection;

    // Retry with exponential backoff on initial connection failure.
    // withAutomaticReconnect() only handles drops after a successful connection.
    const scheduleRetry = (delay: number): void => {
      console.log(`[PaymentSocket] Retrying in ${delay}ms...`);
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connect(delay);
      }, delay);
    };

    const connect = (nextRetryDelay = INITIAL_RETRY_DELAY_MS): void => {
      if (cancelled) return;
      if (connection.state !== signalR.HubConnectionState.Disconnected) return;
      console.log(`[PaymentSocket] Connecting... (orderCode=${orderCode})`);
      connection
        .start()
        .then(() => {
          console.log(`[PaymentSocket] Connected (orderCode=${orderCode})`);
        })
        .catch((err: unknown) => {
          console.warn(
            `[PaymentSocket] Connection failed (orderCode=${orderCode}):`,
            err
          );
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
      console.log(`[PaymentSocket] Disconnecting... (orderCode=${orderCode})`);
      connection.stop().catch(() => {});
    };

    connect();

    // When app returns from background (e.g. banking app), reconnect if disconnected.
    // We intentionally do NOT disconnect on background here — the user is actively
    // waiting for payment confirmation and we want to receive PaymentStatusUpdate
    // in real-time even while the payment browser is open.
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (cancelled) return;
      if (nextState === 'active') {
        connect();
      }
    });

    return (): void => {
      cancelled = true;
      subscription.remove();
      disconnect();
      connectionRef.current = null;
    };
  }, [orderCode]);

  return { paymentStatus };
};
