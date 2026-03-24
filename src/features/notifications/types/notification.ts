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

/** A single notification item returned by GET /api/notifications. */
export interface NotificationDto {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}

/** Paginated response for notifications list. */
export interface NotificationListResponse {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Response for unread count endpoint. */
export interface UnreadCountResponse {
  unreadCount: number;
}
