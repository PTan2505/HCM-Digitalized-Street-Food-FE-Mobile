import { apiUrl } from '@lib/api/apiUrl';
import type ApiClient from '@lib/api/apiClient';
import type { ApiResponse } from '@custom-types/apiResponse';
import type {
  NotificationListResponse,
  UnreadCountResponse,
} from '@features/customer/notifications/types/notification';

export interface RegisterPushTokenRequest {
  expoPushToken: string;
  platform: 'ios' | 'android';
}

export interface RemovePushTokenRequest {
  expoPushToken: string;
}

export class NotificationApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async registerPushToken(
    data: RegisterPushTokenRequest
  ): Promise<ApiResponse<null>> {
    return this.apiClient.post<null, RegisterPushTokenRequest>({
      url: apiUrl.notification.registerToken,
      data,
    });
  }

  async removePushToken(
    data: RemovePushTokenRequest
  ): Promise<ApiResponse<null>> {
    return this.apiClient.post<null, RemovePushTokenRequest>({
      url: apiUrl.notification.removeToken,
      data,
    });
  }

  async getNotifications(
    page: number,
    pageSize: number
  ): Promise<ApiResponse<NotificationListResponse>> {
    return this.apiClient.get<NotificationListResponse>({
      url: apiUrl.notification.list,
      params: { page, pageSize },
    });
  }

  async getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
    return this.apiClient.get<UnreadCountResponse>({
      url: apiUrl.notification.unreadCount,
    });
  }

  async markAsRead(notificationId: number): Promise<ApiResponse<null>> {
    return this.apiClient.put<null, null>({
      url: apiUrl.notification.markRead(notificationId),
    });
  }

  async markAllAsRead(): Promise<ApiResponse<null>> {
    return this.apiClient.put<null, null>({
      url: apiUrl.notification.markAllRead,
    });
  }
}
