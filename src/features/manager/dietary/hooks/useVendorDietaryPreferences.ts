import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { DietaryPreference } from '@user/types/dietaryPreference';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

export const useAllDietaryPreferences = (): UseQueryResult<
  DietaryPreference[]
> =>
  useQuery({
    queryKey: queryKeys.dietary.preferences,
    queryFn: () => axiosApi.dietaryPreferenceApi.getAllDietaryPreferences(),
    staleTime: 5 * 60_000,
  });

export const useMyVendorDietaryPreferences = (
  vendorId: number | undefined
): UseQueryResult<DietaryPreference[]> =>
  useQuery({
    queryKey: queryKeys.vendorBranches.dietaryPreferences(vendorId ?? 0),
    queryFn: () =>
      axiosApi.vendorBranchApi.getMyVendorDietaryPreferences(vendorId ?? 0),
    enabled: vendorId != null && vendorId > 0,
  });

export const useUpdateMyVendorDietaryPreferences = (
  vendorId: number | undefined
): UseMutationResult<DietaryPreference[], Error, number[]> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      axiosApi.vendorBranchApi.updateMyVendorDietaryPreferences(ids),
    onSuccess: () => {
      if (vendorId != null && vendorId > 0) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.vendorBranches.dietaryPreferences(vendorId),
        });
      }
    },
  });
};
