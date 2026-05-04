import type { PickedFile } from '@manager/vendor-branches/api/vendorBranchApi';
import type {
  CreateOrUpdateBranchResponse,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  ManagerBranch,
  SubmitImagesResponse,
  SubmitLicenseResponse,
  UpdateBranchRequest,
  VendorRegistrationRequest,
  VendorRegistrationResponse,
} from '@manager/branch/branch.types';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

const invalidateAll = (
  queryClient: ReturnType<typeof useQueryClient>
): void => {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.vendorBranches.all,
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.managerBranch.all,
  });
};

export const useRegisterVendor = (): UseMutationResult<
  VendorRegistrationResponse,
  Error,
  VendorRegistrationRequest
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosApi.vendorBranchApi.registerVendor(data),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useCreateBranch = (
  vendorId: number
): UseMutationResult<
  CreateOrUpdateBranchResponse,
  Error,
  VendorRegistrationRequest
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosApi.vendorBranchApi.createBranch(vendorId, data),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useUpdateBranchWithLocation = (
  branchId: number
): UseMutationResult<ManagerBranch, Error, UpdateBranchRequest> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosApi.vendorBranchApi.updateBranch(branchId, data),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useSubmitBranchLicense = (): UseMutationResult<
  SubmitLicenseResponse,
  Error,
  { branchId: number; licenseImages: PickedFile[] }
> =>
  useMutation({
    mutationFn: ({ branchId, licenseImages }) =>
      axiosApi.vendorBranchApi.submitLicense(branchId, licenseImages),
  });

export const useSubmitBranchImages = (): UseMutationResult<
  SubmitImagesResponse[],
  Error,
  { branchId: number; images: PickedFile[] }
> =>
  useMutation({
    mutationFn: ({ branchId, images }) =>
      axiosApi.vendorBranchApi.submitImages(branchId, images),
  });

export const useCreateSubscriptionPaymentLink = (): UseMutationResult<
  CreatePaymentLinkResponse,
  Error,
  CreatePaymentLinkRequest
> =>
  useMutation({
    mutationFn: (data) =>
      axiosApi.vendorBranchApi.createSubscriptionPaymentLink(data),
  });
