import { useEffect } from 'react';
import type * as Notifications from 'expo-notifications';
import { navigationRef } from '@utils/navigationRef';
import type { NotificationData } from '@features/notifications/types/notification';

/**
 * Reacts to notification taps and navigates to the relevant screen
 * using the shared navigation ref (works outside the NavigationContainer).
 *
 * Extend the switch-case below when new notification types are added.
 */
export const useNotificationNavigation = (
  lastResponse: Notifications.NotificationResponse | null
): void => {
  useEffect(() => {
    if (!lastResponse) return;
    if (!navigationRef.isReady()) return;

    const data = lastResponse.notification.request.content
      .data as unknown as NotificationData;

    switch (data.type) {
      case 'order_status':
        if (data.orderId) {
          navigationRef.navigate('OrderStatus', {
            orderId: data.orderId,
            branchName: data.branchName ?? '',
            readOnly: true,
          });
        }
        break;

      case 'vendor_reply':
        if (data.branchId) {
          navigationRef.navigate('ReviewList', {
            branchId: data.branchId,
            displayName: data.branchName ?? '',
            ownFeedbackId: data.feedbackId,
            dishes: [],
            branchLat: 0,
            branchLong: 0,
          });
        }
        break;

      default:
        break;
    }
  }, [lastResponse]);
};
