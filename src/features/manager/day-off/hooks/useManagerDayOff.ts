import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type {
  CreateDayOffRequest,
  DayOff,
} from '@manager/day-off/api/managerDayOffApi';
import { selectManagerBranchId } from '@slices/managerAuth';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useSelector } from 'react-redux';

export const useManagerDayOffList = (): UseQueryResult<DayOff[]> => {
  const branchId = useSelector(selectManagerBranchId);
  return useQuery({
    queryKey: queryKeys.managerDayOff.list(branchId ?? 0),
    queryFn: () => axiosApi.managerDayOffApi.getDayOffs(branchId ?? 0),
    enabled: (branchId ?? 0) > 0,
  });
};

export const useCreateDayOff = (): UseMutationResult<
  DayOff,
  Error,
  CreateDayOffRequest
> => {
  const branchId = useSelector(selectManagerBranchId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      axiosApi.managerDayOffApi.createDayOff(branchId ?? 0, data),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerDayOff.all,
      }),
  });
};

export const useDeleteDayOff = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayOffId) => axiosApi.managerDayOffApi.deleteDayOff(dayOffId),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerDayOff.all,
      }),
  });
};
