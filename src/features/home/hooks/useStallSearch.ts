import { axiosApi } from '@lib/api/apiInstance';
import type { ActiveBranch } from '@features/home/types/branch';
import type { StallSearchParams } from '@features/home/types/stall';
import { useCallback, useState } from 'react';

export const useStallSearch = (): {
  stalls: ActiveBranch[];
  imageMap: Record<number, string>;
  isLoading: boolean;
  error: string | null;
  search: (params: StallSearchParams) => Promise<void>;
  clearError: () => void;
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

      const imageResults = await Promise.all(
        result.map((branch) =>
          axiosApi.branchApi
            .getBranchImages(branch.branchId, 1, 1)
            .then((res) => ({
              branchId: branch.branchId,
              imageUrl: res.items[0]?.imageUrl ?? null,
            }))
            .catch(() => ({ branchId: branch.branchId, imageUrl: null }))
        )
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

  return { stalls, imageMap, isLoading, error, search, clearError };
};
