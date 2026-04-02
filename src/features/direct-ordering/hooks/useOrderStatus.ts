import type { OrderResponse } from '@features/direct-ordering/api/cartApi';
import { ORDER_STATUS } from '@features/direct-ordering/api/cartApi';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  confirmPaymentThunk,
  fetchOrderThunk,
  selectActiveOrder,
  selectCheckoutOrderCode,
} from '@slices/directOrdering';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

const POLL_INTERVAL = 10_000;
const TERMINAL_STATUSES: number[] = [
  ORDER_STATUS.Complete,
  ORDER_STATUS.Cancelled,
];

export const useOrderStatus = (
  orderId: number
): { order: OrderResponse | null } => {
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectActiveOrder);
  const checkoutOrderCode = useAppSelector(selectCheckoutOrderCode);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderStatusRef = useRef<number | undefined>(undefined);
  const orderCodeRef = useRef<number | null>(null);

  useEffect(() => {
    orderStatusRef.current = order?.status;
  }, [order?.status]);

  useEffect(() => {
    orderCodeRef.current = checkoutOrderCode;
  }, [checkoutOrderCode]);

  useEffect(() => {
    dispatch(fetchOrderThunk(orderId));

    const stopPolling = (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startPolling = (): void => {
      stopPolling();
      intervalRef.current = setInterval(() => {
        dispatch(fetchOrderThunk(orderId));
      }, POLL_INTERVAL);
    };

    startPolling();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const currentOrderCode = orderCodeRef.current;
        const currentStatus = orderStatusRef.current;

        if (currentOrderCode && currentStatus === ORDER_STATUS.Pending) {
          dispatch(
            confirmPaymentThunk({ orderCode: currentOrderCode })
          ).finally(() => {
            dispatch(fetchOrderThunk(orderId));
            startPolling();
          });
        } else {
          dispatch(fetchOrderThunk(orderId));
          startPolling();
        }
      } else {
        stopPolling();
      }
    });

    return (): void => {
      stopPolling();
      subscription.remove();
    };
  }, [orderId, dispatch]);

  // Stop polling when status is terminal
  const orderStatus = order?.status;
  useEffect(() => {
    if (orderStatus !== undefined && TERMINAL_STATUSES.includes(orderStatus)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [orderStatus]);

  return { order };
};
