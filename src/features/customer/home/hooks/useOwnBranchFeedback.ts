import type { Feedback } from '@features/customer/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import { useCallback, useEffect, useState } from 'react';

export interface OwnBranchFeedbackResult {
  ownFeedback: Feedback | undefined;
  isLoading: boolean;
  refetch: () => void;
  setOwnFeedback: (feedback: Feedback | undefined) => void;
}

/**
 * Finds the current user's feedback for a specific branch by intersecting:
 *   - GET /Feedback/branch/{branchId}  → all feedback IDs for this branch
 *   - GET /Feedback/my-feedback        → all feedback IDs owned by the user
 *
 * The overlap gives us the user's review for this branch without needing
 * a branchId field in the FeedbackResponseDto.
 */
export const useOwnBranchFeedback = (
  branchId: number
): OwnBranchFeedbackResult => {
  const [ownFeedback, setOwnFeedback] = useState<Feedback | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(() => {
    setIsLoading(true);

    Promise.all([
      axiosApi.feedbackApi.getBranchFeedback(branchId, { pageSize: 100 }),
      axiosApi.feedbackApi.getMyFeedback({ pageSize: 100 }),
    ])
      .then(([branchResult, myResult]) => {
        const branchIds = new Set(branchResult.items.map((f) => f.id));
        const found = myResult.items.find((f) => branchIds.has(f.id));
        setOwnFeedback(found);
      })
      .catch(() => {
        setOwnFeedback(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [branchId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const setOwnFeedbackManually = useCallback(
    (feedback: Feedback | undefined) => {
      setOwnFeedback(feedback);
    },
    []
  );

  return {
    ownFeedback,
    isLoading,
    refetch: fetch,
    setOwnFeedback: setOwnFeedbackManually,
  };
};
