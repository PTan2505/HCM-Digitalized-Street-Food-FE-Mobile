import type { OrderResponse } from '@features/direct-ordering/api/cartApi';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { fetchOrderThunk, selectActiveOrder } from '@slices/directOrdering';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

const POLL_INTERVAL = 10_000;
const TERMINAL_STATUSES = ['Completed', 'Rejected', 'Cancelled'];

export const useOrderStatus = (
  orderId: number
): { order: OrderResponse | null } => {
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectActiveOrder);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        dispatch(fetchOrderThunk(orderId));
        startPolling();
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
    if (orderStatus && TERMINAL_STATUSES.includes(orderStatus)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [orderStatus]);

  return { order };
};
