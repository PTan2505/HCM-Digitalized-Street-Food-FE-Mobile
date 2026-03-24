import { useCallback, useState } from 'react';
import { axiosApi } from '@lib/api/apiInstance';
import type { ActiveBranch } from '@features/home/types/branch';
import type { StallSearchParams } from '@features/home/types/stall';

export const useStallSearch = (): {
  stalls: ActiveBranch[];
  isLoading: boolean;
  error: string | null;
  search: (params: StallSearchParams) => Promise<void>;
  clearError: () => void;
} => {
  const [stalls, setStalls] = useState<ActiveBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: StallSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await axiosApi.stallSearchApi.searchStalls(params);
      setStalls(result);
    } catch {
      setError('Không thể tải kết quả tìm kiếm. Vui lòng thử lại.');
      setStalls([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { stalls, isLoading, error, search, clearError };
};
