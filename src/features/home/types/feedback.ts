export interface FeedbackUser {
  userId: string;
  fullName: string;
  avatarUrl?: string;
}

export interface FeedbackDish {
  dishId: number;
  name: string;
}

export interface FeedbackImage {
  id: number;
  imageUrl: string;
}

export interface FeedbackTag {
  id: number;
  name: string;
}

export interface VendorReply {
  id: number;
  content: string;
  createdAt: string;
}

export interface Feedback {
  id: number;
  user?: FeedbackUser;
  dishId?: number;
  dish?: FeedbackDish;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  images?: FeedbackImage[];
  tags?: FeedbackTag[];
  upVotes: number;
  downVotes: number;
  netScore: number;
  userVote?: string;
  vendorReply?: VendorReply;
}

export interface FeedbackAverageRating {
  branchId: number;
  averageRating: number;
}

export interface FeedbackCount {
  branchId: number;
  feedbackCount: number;
}

export interface PaginatedFeedback {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Feedback[];
}
