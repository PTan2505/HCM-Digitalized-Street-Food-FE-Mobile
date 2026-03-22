/**
 * Notification types matching the data payload sent from the backend
 * via Expo Push Notification service.
 */

export type NotificationType = 'vendor_reply' | 'order_status';

/** The `data` field inside a push notification payload. */
export interface NotificationData {
  type: NotificationType;

  // vendor_reply
  feedbackId?: number;
  branchId?: number;
  branchName?: string;

  // order_status
  orderId?: number;
  orderStatus?: string;
}
