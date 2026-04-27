import { useQuery } from '@tanstack/react-query';
import type {
  DayOff,
  WorkSchedule,
} from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { isOpenNow } from '@utils/scheduleUtils';

export interface UseWorkScheduleResult {
  schedules: WorkSchedule[];
  dayOffs: DayOff[];
  isLoading: boolean;
  isOpen: boolean;
}

export const useWorkSchedule = (
  branchId: number | null
): UseWorkScheduleResult => {
  const { data: schedules = [], isLoading: isScheduleLoading } = useQuery({
    queryKey: queryKeys.workSchedule.detail(branchId!),
    queryFn: () => axiosApi.branchApi.getWorkSchedules(branchId!),
    enabled: !!branchId,
    staleTime: 3 * 60 * 1000,
  });

  const { data: dayOffs = [], isLoading: isDayOffLoading } = useQuery({
    queryKey: queryKeys.dayOffs.branch(branchId!),
    queryFn: () => axiosApi.branchApi.getDayOffs(branchId!),
    enabled: !!branchId,
    staleTime: 3 * 60 * 1000,
  });

  return {
    schedules,
    dayOffs,
    isLoading: isScheduleLoading || isDayOffLoading,
    isOpen: isOpenNow(schedules, dayOffs),
  };
};
