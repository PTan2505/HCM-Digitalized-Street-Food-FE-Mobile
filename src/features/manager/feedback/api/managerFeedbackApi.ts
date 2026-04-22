import type {
  Feedback,
  PaginatedFeedback,
  VendorReply,
} from '@features/customer/home/types/feedback';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface PaginatedFeedbackParams {
  pageNumber?: number;
  pageSize?: number;
}

export class ManagerFeedbackApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getFeedbacksByBranch(
    branchId: number,
    params: PaginatedFeedbackParams = {}
  ): Promise<PaginatedFeedback> {
    const res = await this.apiClient.get<PaginatedFeedback>({
      url: apiUrl.feedback.byBranch(branchId),
      params: { pageNumber: 1, pageSize: 10, ...params },
    });
    return res.data;
  }

  async getFeedbackDetail(feedbackId: number): Promise<Feedback> {
    const res = await this.apiClient.get<Feedback>({
      url: apiUrl.feedback.byId(feedbackId),
    });
    return res.data;
  }

  async createReply(feedbackId: number, content: string): Promise<VendorReply> {
    const res = await this.apiClient.post<VendorReply, { content: string }>({
      url: apiUrl.feedback.reply(feedbackId),
      data: { content },
    });
    return res.data;
  }

  async updateReply(feedbackId: number, content: string): Promise<VendorReply> {
    const res = await this.apiClient.put<VendorReply, { content: string }>({
      url: apiUrl.feedback.reply(feedbackId),
      data: { content },
    });
    return res.data;
  }

  async deleteReply(feedbackId: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.feedback.reply(feedbackId),
    });
  }
}
