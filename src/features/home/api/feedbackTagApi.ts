import type {
  FeedbackTag,
  FeedbackTagDto,
} from '@features/home/types/feedback';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class FeedbackTagApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getTags(): Promise<FeedbackTag[]> {
    const res = await this.apiClient.get<FeedbackTagDto[]>({
      url: apiUrl.feedbackTag.getAll,
    });
    return res.data.map((dto) => ({ id: dto.tagId, name: dto.tagName }));
  }
}
