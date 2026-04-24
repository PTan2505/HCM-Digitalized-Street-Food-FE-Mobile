import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { WorkSchedule } from '@manager/schedule/api/managerScheduleApi';
import { selectManagerBranchId } from '@slices/managerAuth';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useSelector } from 'react-redux';

export const useManagerScheduleList = (): UseQueryResult<WorkSchedule[]> => {
  const branchId = useSelector(selectManagerBranchId);
  return useQuery({
    queryKey: queryKeys.managerSchedule.list(branchId ?? 0),
    queryFn: () => axiosApi.managerScheduleApi.getWorkSchedules(branchId ?? 0),
    enabled: (branchId ?? 0) > 0,
  });
};

export const useCreateWorkSchedule = (): UseMutationResult<
  void,
  Error,
  { weekdays: number[]; openTime: string; closeTime: string }
> => {
  const branchId = useSelector(selectManagerBranchId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      axiosApi.managerScheduleApi.createWorkSchedule(branchId ?? 0, data),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerSchedule.all,
      }),
  });
};

export const useUpdateWorkSchedule = (): UseMutationResult<
  void,
  Error,
  { id: number; weekday: number; openTime: string; closeTime: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      axiosApi.managerScheduleApi.updateWorkSchedule(id, data),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerSchedule.all,
      }),
  });
};

export const useDeleteWorkSchedule = (): UseMutationResult<
  void,
  Error,
  number
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId) =>
      axiosApi.managerScheduleApi.deleteWorkSchedule(scheduleId),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerSchedule.all,
      }),
  });
};
