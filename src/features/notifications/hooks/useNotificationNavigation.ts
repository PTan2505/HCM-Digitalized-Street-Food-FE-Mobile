import type { NotificationData } from '@features/notifications/types/notification';
import { navigationRef } from '@utils/navigationRef';
import type * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';

/**
 * Reacts to notification taps and navigates to the relevant screen
 * using the shared navigation ref (works outside the NavigationContainer).
 *
 * On cold-start the sequence is:
 *   useLastNotificationResponse → navigator mounts (Auth) → auth loads →
 *   AuthScreen replaces to Main → THEN we navigate.
 *
 * We must wait for both:
 *   1. The navigator to be ready
 *   2. The user to be authenticated (auth flow settled, Main is active)
 * Otherwise, navigating to ReviewList while still on Auth will be wiped
 * by AuthScreen's `navigation.replace('Main')`.
 */
export const useNotificationNavigation = (
  lastResponse: Notifications.NotificationResponse | null,
  isAuthenticated: boolean
): void => {
  const [isNavReady, setIsNavReady] = useState(navigationRef.isReady());

  // Prevent re-processing the same notification on subsequent renders.
  const processedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isNavReady) return;

    const unsubscribe = navigationRef.addListener('state', () => {
      if (navigationRef.isReady()) {
        setIsNavReady(true);
      }
    });

    if (navigationRef.isReady()) {
      setIsNavReady(true);
    }

    return unsubscribe;
  }, [isNavReady]);

  useEffect(() => {
    if (!lastResponse) return;
    if (!isNavReady) return;
    if (!isAuthenticated) return;

    // Deduplicate: don't navigate again for the same notification tap.
    const responseId = lastResponse.notification.request.identifier;
    if (processedIdRef.current === responseId) return;
    processedIdRef.current = responseId;

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
            branchLat: 0,
            branchLong: 0,
          });
        }
        break;

      case 'quest_task_completed':
      case 'quest_completed':
        if (data.questId) {
          navigationRef.navigate('QuestDetail', { questId: data.questId });
        }
        break;

      default:
        break;
    }
  }, [lastResponse, isNavReady, isAuthenticated]);
};
