import { selectNotifications } from '@slices/notifications';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const NEW_ORDER_TYPE = 'NewOrder';

export const useNewOrderNotification = (onNewOrder: () => void): void => {
  const items = useSelector(selectNotifications);
  const latest = items[0];
  const lastIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!latest) return;
    if (latest.notificationId === lastIdRef.current) return;
    lastIdRef.current = latest.notificationId;
    if (latest.type === NEW_ORDER_TYPE || latest.type === '5') {
      onNewOrder();
    }
  }, [latest, onNewOrder]);
};
