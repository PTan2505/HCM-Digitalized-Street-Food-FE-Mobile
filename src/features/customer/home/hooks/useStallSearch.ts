import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { StallSearchParams } from '@features/customer/home/types/stall';
import { axiosApi } from '@lib/api/apiInstance';
import { useCallback, useState } from 'react';

const MAX_SIBLING_PREFETCH = 3;

async function fetchBranchImage(
  branchId: number
): Promise<{ branchId: number; imageUrl: string | null }> {
  return axiosApi.branchApi
    .getBranchImages(branchId, 1, 1)
    .then((res) => ({ branchId, imageUrl: res.items[0]?.imageUrl ?? null }))
    .catch(() => ({ branchId, imageUrl: null }));
}

export const useStallSearch = (): {
  stalls: ActiveBranch[];
  imageMap: Record<number, string>;
  isLoading: boolean;
  error: string | null;
  search: (params: StallSearchParams) => Promise<void>;
  clearError: () => void;
  updateBranchRating: (
    branchId: number,
    avgRating: number,
    totalReviewCount: number
  ) => void;
} => {
  const [stalls, setStalls] = useState<ActiveBranch[]>([]);
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: StallSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await axiosApi.stallSearchApi.searchStalls(params);
      setStalls(result);

      // Fetch images for each primary branch + first 3 siblings
      const branchIdsToFetch: number[] = [];
      for (const branch of result) {
        branchIdsToFetch.push(branch.branchId);
        const siblings = branch.otherBranches ?? [];
        for (
          let i = 0;
          i < Math.min(siblings.length, MAX_SIBLING_PREFETCH);
          i++
        ) {
          branchIdsToFetch.push(siblings[i].branchId);
        }
      }

      const imageResults = await Promise.all(
        branchIdsToFetch.map(fetchBranchImage)
      );
      const map: Record<number, string> = {};
      for (const { branchId, imageUrl } of imageResults) {
        if (imageUrl) map[branchId] = imageUrl;
      }
      setImageMap(map);
    } catch {
      setError('Không thể tải kết quả tìm kiếm. Vui lòng thử lại.');
      setStalls([]);
      setImageMap({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateBranchRating = useCallback(
    (branchId: number, avgRating: number, totalReviewCount: number): void => {
      setStalls((prev) =>
        prev.map((b) =>
          b.branchId === branchId ? { ...b, avgRating, totalReviewCount } : b
        )
      );
    },
    []
  );

  return {
    stalls,
    imageMap,
    isLoading,
    error,
    search,
    clearError,
    updateBranchRating,
  };
};
