import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { PickedImage } from '@utils/imagePicker';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

interface ClaimBranchInput {
  branchId: number;
  licenseImages: PickedImage[];
}

export const useClaimBranch = (): UseMutationResult<
  unknown,
  Error,
  ClaimBranchInput
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, licenseImages }: ClaimBranchInput) =>
      axiosApi.vendorBranchApi.claimBranch(branchId, licenseImages),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.branches.allGhostPins,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.vendorBranches.all,
      });
    },
  });
};
