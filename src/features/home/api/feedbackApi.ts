import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type {
  FeedbackAverageRating,
  FeedbackCount,
  PaginatedFeedback,
} from '@features/home/types/feedback';

export class FeedbackApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getBranchFeedback(
    branchId: number,
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedFeedback> {
    const res = await this.apiClient.get<PaginatedFeedback>({
      url: apiUrl.feedback.byBranch(branchId),
      params: { pageNumber, pageSize },
    });
    return res.data;
  }

  async getAverageRating(branchId: number): Promise<FeedbackAverageRating> {
    const res = await this.apiClient.get<FeedbackAverageRating>({
      url: apiUrl.feedback.averageRating(branchId),
    });
    return res.data;
  }

  async getFeedbackCount(branchId: number): Promise<FeedbackCount> {
    const res = await this.apiClient.get<FeedbackCount>({
      url: apiUrl.feedback.count(branchId),
    });
    return res.data;
  }
}
