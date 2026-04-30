import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type { ApiResponse } from '@custom-types/apiResponse';
import type { AiChatResponse } from '@features/customer/chatbot/types/chatbot';

export class ChatApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async sendMessage(
    message: string,
    lat?: number | null,
    long?: number | null,
    distanceKm?: number | null
  ): Promise<ApiResponse<AiChatResponse>> {
    return this.apiClient.post<
      AiChatResponse,
      {
        message: string;
        lat?: number | null;
        long?: number | null;
        distanceKm?: number | null;
      }
    >({
      url: apiUrl.ai.chat,
      data: { message, lat, long, distanceKm },
    });
  }
}
