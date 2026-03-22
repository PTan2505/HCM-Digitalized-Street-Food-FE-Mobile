import { useQuery } from '@tanstack/react-query';
import type { WorkSchedule } from '@features/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { isOpenNow } from '@utils/scheduleUtils';

export interface UseWorkScheduleResult {
  schedules: WorkSchedule[];
  isLoading: boolean;
  isOpen: boolean;
}

/**
 * Fetches work schedules for a branch, with automatic caching.
 *
 * HOW useQuery WORKS:
 * - `queryKey`: Unique cache ID. When branchId=42, key is ['workSchedule', 42].
 *   Any component using the same key shares the cached result (no duplicate API call).
 *
 * - `queryFn`: The function that fetches data. React Query calls this automatically
 *   when the cache is empty or stale.
 *
 * - `enabled`: Query only runs when branchId is truthy. This replaces the
 *   `if (!branchId) return;` guard we had in useEffect.
 *
 * - `staleTime`: 3 minutes. If you navigate away and come back within 3 min,
 *   the cached schedule shows instantly (no spinner, no API call).
 *   After 3 min, React Query refetches in the background — you still see
 *   the old data immediately, but it updates silently if changed.
 *
 * WHAT WE REMOVED:
 * - useState for schedules, isLoading (React Query manages these)
 * - useEffect with manual API call
 * - Cancelled flag for cleanup (React Query handles unmount cancellation)
 */
export const useWorkSchedule = (
  branchId: number | null
): UseWorkScheduleResult => {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: queryKeys.workSchedule.detail(branchId!),
    queryFn: () => axiosApi.branchApi.getWorkSchedules(branchId!),
    enabled: !!branchId,
    staleTime: 3 * 60 * 1000, // Schedules rarely change — 3 min cache
  });

  return {
    schedules,
    isLoading,
    isOpen: isOpenNow(schedules),
  };
};
