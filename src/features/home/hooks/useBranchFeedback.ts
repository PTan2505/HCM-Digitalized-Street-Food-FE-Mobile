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
  addFeedback: (feedback: Feedback) => void;
  updateFeedback: (feedback: Feedback) => void;
  removeFeedback: (feedbackId: number) => void;
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

  const addFeedback = useCallback((feedback: Feedback) => {
    setFeedbacks((prev) => [feedback, ...prev]);
    setTotalCount((prevCount) => {
      const newCount = prevCount + 1;
      // Recalculate average rating based on new count
      setAverageRating((prevAvg) => {
        const totalRating = prevAvg * prevCount + feedback.rating;
        return totalRating / newCount;
      });
      return newCount;
    });
  }, []);

  const updateFeedback = useCallback((feedback: Feedback) => {
    setFeedbacks((prev) => {
      const oldFeedback = prev.find((f) => f.id === feedback.id);
      const updated = prev.map((f) => (f.id === feedback.id ? feedback : f));

      // Recalculate average rating if rating changed
      if (oldFeedback && oldFeedback.rating !== feedback.rating) {
        setTotalCount((currentCount) => {
          setAverageRating((prevAvg) => {
            const totalRating =
              prevAvg * currentCount - oldFeedback.rating + feedback.rating;
            return totalRating / currentCount;
          });
          return currentCount;
        });
      }

      return updated;
    });
  }, []);

  const removeFeedback = useCallback((feedbackId: number) => {
    setFeedbacks((prev) => {
      const removed = prev.find((f) => f.id === feedbackId);
      const filtered = prev.filter((f) => f.id !== feedbackId);

      // Recalculate average rating and count
      if (removed) {
        setTotalCount((prevCount) => {
          const newCount = prevCount - 1;
          setAverageRating((prevAvg) => {
            if (newCount === 0) return 0;
            const totalRating = prevAvg * prevCount - removed.rating;
            return totalRating / newCount;
          });
          return newCount;
        });
      }

      return filtered;
    });
  }, []);

  return {
    feedbacks,
    averageRating,
    totalCount,
    isLoading,
    error,
    refetch: load,
    addFeedback,
    updateFeedback,
    removeFeedback,
  };
};
