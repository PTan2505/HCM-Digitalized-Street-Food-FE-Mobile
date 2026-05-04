import type { VendorInfo } from '@manager/vendor-branches/api/vendorBranchApi';
import type {
  ManagerBranch,
  UpdateBranchRequest,
} from '@manager/branch/branch.types';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

export const useVendorInfo = (): UseQueryResult<VendorInfo> =>
  useQuery({
    queryKey: queryKeys.vendorBranches.vendorInfo(),
    queryFn: () => axiosApi.vendorBranchApi.getVendorInfo(),
  });

export const useVendorBranchDetail = (
  branchId: number
): UseQueryResult<ManagerBranch> =>
  useQuery({
    queryKey: queryKeys.vendorBranches.detail(branchId),
    queryFn: () => axiosApi.managerBranchApi.getBranchById(branchId),
    enabled: branchId > 0,
  });

export const useUpdateVendorBranch = (
  branchId: number
): UseMutationResult<ManagerBranch, Error, UpdateBranchRequest> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBranchRequest) =>
      axiosApi.vendorBranchApi.updateBranch(branchId, data),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: queryKeys.vendorBranches.all,
      }),
  });
};
