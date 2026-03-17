// ── Embedded sub-objects ──────────────────────────────────────────────────────

export interface FeedbackUser {
  id: number;
  name: string;
  avatar?: string;
}

export interface FeedbackDish {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface FeedbackImage {
  id: number;
  url: string;
}

export interface FeedbackTag {
  id: number;
  name: string;
}

export interface VendorReply {
  vendorReplyId: number;
  content: string;
  repliedBy: string;
  createdAt: string;
  updatedAt: string | null;
}

// ── Core DTO (FeedbackResponseDto) ────────────────────────────────────────────

export type VoteType = 'up' | 'down';

export interface Feedback {
  id: number;
  branchId?: number;
  user?: FeedbackUser;
  dishId?: number;
  dish?: FeedbackDish;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string | null;
  images?: FeedbackImage[];
  tags?: FeedbackTag[];
  upVotes: number;
  downVotes: number;
  netScore: number;
  userVote: VoteType | null;
  vendorReply?: VendorReply;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface FeedbackAverageRating {
  branchId: number;
  averageRating: number;
}

export interface FeedbackCount {
  branchId: number;
  feedbackCount: number;
}

// ── Paginated wrapper ─────────────────────────────────────────────────────────

export interface PaginatedFeedback {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Feedback[];
}

// ── CRUD requests ─────────────────────────────────────────────────────────────

export interface SubmitFeedbackRequest {
  branchId: number;
  dishId: number | null;
  orderId: number | null;
  rating: number;
  comment: string | null;
  tagIds: number[];
}

export interface UpdateFeedbackRequest {
  dishId?: number;
  rating: number;
  comment?: string;
  /** null = no change, [] = remove all */
  tagIds?: number[] | null;
}

// ── Voting ────────────────────────────────────────────────────────────────────

export interface VoteRequest {
  voteType: VoteType;
}

export interface VoteResponse {
  upVotes: number;
  downVotes: number;
  netScore: number;
  userVote: VoteType | null;
}

// ── Vendor reply ──────────────────────────────────────────────────────────────

export interface ReplyRequest {
  content: string;
}

// ── Images ────────────────────────────────────────────────────────────────────

export interface FeedbackImageDto {
  id: number;
  url: string;
}

export interface UploadImagesResponse {
  message: string;
  data: Feedback;
}

// ── Velocity check ────────────────────────────────────────────────────────────

export interface VelocityCheckResponse {
  remainingTotalToday: number;
  dailyLimit: number;
  reviewedBranchIds: number[];
}
