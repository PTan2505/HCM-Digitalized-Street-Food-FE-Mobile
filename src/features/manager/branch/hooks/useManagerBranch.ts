import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { UpdateBranchRequest } from '@manager/branch/branch.types';
import { selectManagerBranchId } from '@slices/managerAuth';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { ManagerBranch } from '@manager/branch/branch.types';
import { useSelector } from 'react-redux';

export const useManagerBranchDetail = (): UseQueryResult<ManagerBranch> => {
  const branchId = useSelector(selectManagerBranchId);
  return useQuery({
    queryKey: queryKeys.managerBranch.detail(branchId ?? 0),
    queryFn: () => axiosApi.managerBranchApi.getBranchById(branchId ?? 0),
    enabled: (branchId ?? 0) > 0,
  });
};

export const useUpdateManagerBranch = (): UseMutationResult<
  ManagerBranch,
  Error,
  UpdateBranchRequest
> => {
  const branchId = useSelector(selectManagerBranchId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      axiosApi.managerBranchApi.updateBranch(branchId ?? 0, data),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerBranch.all,
      }),
  });
};
