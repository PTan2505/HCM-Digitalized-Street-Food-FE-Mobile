import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type { ApiResponse } from '@custom-types/apiResponse';
import type { AiChatResponse } from '@features/customer/chatbot/types/chatbot';
import type { PickedImage } from '@utils/imagePicker';

export class ChatApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async sendMessage(
    message: string,
    lat?: number | null,
    long?: number | null,
    distanceKm?: number | null,
    image?: PickedImage | null
  ): Promise<ApiResponse<AiChatResponse>> {
    const formData = new FormData();
    formData.append('Message', message);
    if (lat != null) formData.append('Lat', String(lat));
    if (long != null) formData.append('Long', String(long));
    if (distanceKm != null) formData.append('DistanceKm', String(distanceKm));
    if (image) {
      formData.append('image', {
        uri: image.uri,
        type: image.mimeType,
        name: image.fileName,
      } as unknown as Blob);
    }

    return this.apiClient.post<AiChatResponse, FormData>({
      url: apiUrl.ai.chat,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}
