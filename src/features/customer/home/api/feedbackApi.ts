import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type {
  Feedback,
  FeedbackAverageRating,
  FeedbackCount,
  FeedbackImageDto,
  PaginatedFeedback,
  ReplyRequest,
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
  UploadImagesResponse,
  VelocityCheckResponse,
  VendorReply,
  VoteRequest,
  VoteResponse,
} from '@features/customer/home/types/feedback';

export interface BranchFeedbackParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface RatingRangeParams {
  minRating?: number;
  maxRating?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PageParams {
  pageNumber?: number;
  pageSize?: number;
}

export class FeedbackApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async submitFeedback(data: SubmitFeedbackRequest): Promise<Feedback> {
    const res = await this.apiClient.post<Feedback, SubmitFeedbackRequest>({
      url: apiUrl.feedback.submit,
      data,
    });
    return res.data;
  }

  async getFeedback(id: number): Promise<Feedback> {
    const res = await this.apiClient.get<Feedback>({
      url: apiUrl.feedback.byId(id),
    });
    return res.data;
  }

  async updateFeedback(
    id: number,
    data: UpdateFeedbackRequest
  ): Promise<Feedback> {
    const res = await this.apiClient.put<Feedback, UpdateFeedbackRequest>({
      url: apiUrl.feedback.byId(id),
      data,
    });
    return res.data;
  }

  async deleteFeedback(id: number): Promise<void> {
    await this.apiClient.delete<void>({ url: apiUrl.feedback.byId(id) });
  }

  // ── Listing ────────────────────────────────────────────────────────────────

  async getBranchFeedback(
    branchId: number,
    params: BranchFeedbackParams = {}
  ): Promise<PaginatedFeedback> {
    const res = await this.apiClient.get<PaginatedFeedback>({
      url: apiUrl.feedback.byBranch(branchId),
      params: { pageNumber: 1, pageSize: 10, ...params },
    });
    return res.data;
  }

  async getBranchFeedbackByRatingRange(
    branchId: number,
    params: RatingRangeParams = {}
  ): Promise<PaginatedFeedback> {
    const res = await this.apiClient.get<PaginatedFeedback>({
      url: apiUrl.feedback.byRatingRange(branchId),
      params: {
        minRating: 1,
        maxRating: 5,
        pageNumber: 1,
        pageSize: 10,
        ...params,
      },
    });
    return res.data;
  }

  async getUserFeedback(
    userId: number,
    params: PageParams = {}
  ): Promise<PaginatedFeedback> {
    const res = await this.apiClient.get<PaginatedFeedback>({
      url: apiUrl.feedback.byUser(userId),
      params: { pageNumber: 1, pageSize: 10, ...params },
    });
    return res.data;
  }

  async getMyFeedback(params: PageParams = {}): Promise<PaginatedFeedback> {
    const res = await this.apiClient.get<PaginatedFeedback>({
      url: apiUrl.feedback.myFeedback,
      params: { pageNumber: 1, pageSize: 10, ...params },
    });
    return res.data;
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

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

  // ── Images ─────────────────────────────────────────────────────────────────

  async getFeedbackImages(feedbackId: number): Promise<FeedbackImageDto[]> {
    const res = await this.apiClient.get<FeedbackImageDto[]>({
      url: apiUrl.feedback.images(feedbackId),
    });
    return res.data;
  }

  async uploadFeedbackImages(
    feedbackId: number,
    formData: FormData
  ): Promise<UploadImagesResponse> {
    const res = await this.apiClient.post<UploadImagesResponse, FormData>({
      url: apiUrl.feedback.images(feedbackId),
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async deleteFeedbackImage(
    feedbackId: number,
    imageId: number
  ): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.feedback.imageById(feedbackId, imageId),
    });
  }

  // ── Voting ─────────────────────────────────────────────────────────────────

  async voteFeedback(
    feedbackId: number,
    voteType: VoteRequest['voteType']
  ): Promise<VoteResponse> {
    const res = await this.apiClient.post<VoteResponse, VoteRequest>({
      url: apiUrl.feedback.vote(feedbackId),
      data: { voteType },
    });
    return res.data;
  }

  // ── Vendor reply ───────────────────────────────────────────────────────────

  async replyToFeedback(
    feedbackId: number,
    content: string
  ): Promise<VendorReply> {
    const res = await this.apiClient.post<VendorReply, ReplyRequest>({
      url: apiUrl.feedback.reply(feedbackId),
      data: { content },
    });
    return res.data;
  }

  async updateReply(feedbackId: number, content: string): Promise<VendorReply> {
    const res = await this.apiClient.put<VendorReply, ReplyRequest>({
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

  // ── Velocity ───────────────────────────────────────────────────────────────

  async checkVelocity(params?: {
    branchId?: number;
    userLat?: number;
    userLong?: number;
  }): Promise<VelocityCheckResponse> {
    const res = await this.apiClient.get<VelocityCheckResponse>({
      url: apiUrl.feedback.velocityCheck,
      params,
    });
    return res.data;
  }
}
