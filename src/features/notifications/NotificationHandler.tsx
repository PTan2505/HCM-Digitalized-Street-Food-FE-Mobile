import { useNotificationNavigation } from '@features/notifications/hooks/useNotificationNavigation';
import { useNotifications } from '@features/notifications/hooks/useNotifications';
import { useNotificationSocket } from '@features/notifications/hooks/useNotificationSocket';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';

/**
 * Invisible component that initializes push notifications and handles
 * navigation when the user taps a notification.
 *
 * Must be rendered inside the Redux Provider. Uses navigationRef for
 * imperative navigation (no NavigationContainer ancestor required).
 */
export const NotificationHandler = (): null => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = !!user;

  const { lastResponse } = useNotifications(isAuthenticated);
  useNotificationNavigation(lastResponse, isAuthenticated);
  useNotificationSocket(isAuthenticated);

  return null;
};
