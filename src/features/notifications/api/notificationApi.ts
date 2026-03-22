import { apiUrl } from '@lib/api/apiUrl';
import type ApiClient from '@lib/api/apiClient';
import type { ApiResponse } from '@custom-types/apiResponse';

export interface RegisterPushTokenRequest {
  expoPushToken: string;
  platform: 'ios' | 'android';
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
}
