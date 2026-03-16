import { useEffect, useState } from 'react';
import type { WorkSchedule } from '@features/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { isOpenNow } from '@utils/scheduleUtils';

export interface UseWorkScheduleResult {
  schedules: WorkSchedule[];
  isLoading: boolean;
  isOpen: boolean;
}

export const useWorkSchedule = (
  branchId: number | null
): UseWorkScheduleResult => {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!branchId) return;

    let cancelled = false;
    setIsLoading(true);

    axiosApi.branchApi
      .getWorkSchedules(branchId)
      .then((data) => {
        if (!cancelled) setSchedules(data);
      })
      .catch(() => {
        // Graceful degradation — no badge shown on error
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  return {
    schedules,
    isLoading,
    isOpen: isOpenNow(schedules),
  };
};
