import type { Feedback } from '@features/customer/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import { useCallback, useEffect, useState } from 'react';

export interface OwnBranchFeedbackResult {
  ownFeedbacks: Feedback[];
  isLoading: boolean;
  refetch: () => void;
  setOwnFeedbacks: (feedbacks: Feedback[]) => void;
}

/**
 * Finds all feedback the current user has submitted for a specific branch by
 * intersecting:
 *   - GET /Feedback/branch/{branchId}  → all feedback IDs for this branch
 *   - GET /Feedback/my-feedback        → all feedback owned by the user
 *
 * Returns every match so that multi-order reviews are all tracked locally.
 */
export const useOwnBranchFeedback = (
  branchId: number
): OwnBranchFeedbackResult => {
  const [ownFeedbacks, setOwnFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(() => {
    setIsLoading(true);

    Promise.all([
      axiosApi.feedbackApi.getBranchFeedback(branchId, { pageSize: 100 }),
      axiosApi.feedbackApi.getMyFeedback({ pageSize: 100 }),
    ])
      .then(([branchResult, myResult]) => {
        const branchIds = new Set(branchResult.items.map((f) => f.id));
        const found = myResult.items.filter((f) => branchIds.has(f.id));
        setOwnFeedbacks(found);
      })
      .catch(() => {
        setOwnFeedbacks([]);
      })
      .finally(() => setIsLoading(false));
  }, [branchId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const setOwnFeedbacksManually = useCallback((feedbacks: Feedback[]) => {
    setOwnFeedbacks(feedbacks);
  }, []);

  return {
    ownFeedbacks,
    isLoading,
    refetch: fetch,
    setOwnFeedbacks: setOwnFeedbacksManually,
  };
};
