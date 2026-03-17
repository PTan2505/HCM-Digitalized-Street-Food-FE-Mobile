import { useCallback, useEffect, useState } from 'react';

import type { Feedback } from '@features/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';

export interface BranchFeedbackResult {
  feedbacks: Feedback[];
  averageRating: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBranchFeedback = (branchId: number): BranchFeedbackResult => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      axiosApi.feedbackApi.getBranchFeedback(branchId),
      axiosApi.feedbackApi.getAverageRating(branchId),
      axiosApi.feedbackApi.getFeedbackCount(branchId),
    ])
      .then(([paginatedFeedback, ratingData, countData]) => {
        setFeedbacks(paginatedFeedback.items);
        setAverageRating(ratingData.averageRating);
        setTotalCount(countData.feedbackCount);
      })
      .catch(() => setError('Không thể tải đánh giá. Vui lòng thử lại.'))
      .finally(() => setIsLoading(false));
  }, [branchId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    feedbacks,
    averageRating,
    totalCount,
    isLoading,
    error,
    refetch: load,
  };
};
