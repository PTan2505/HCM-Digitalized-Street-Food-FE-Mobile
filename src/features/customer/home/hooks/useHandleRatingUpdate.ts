import { useCallback } from 'react';

export const useHandleRatingUpdate = (
  updateBranchRating: (
    branchId: number,
    avgRating: number,
    totalReviewCount: number
  ) => void
): ((
  branchId: number,
  avgRating: number,
  totalReviewCount: number
) => void) => {
  return useCallback(
    (branchId: number, avgRating: number, totalReviewCount: number) => {
      updateBranchRating(branchId, avgRating, totalReviewCount);
    },
    [updateBranchRating]
  );
};
