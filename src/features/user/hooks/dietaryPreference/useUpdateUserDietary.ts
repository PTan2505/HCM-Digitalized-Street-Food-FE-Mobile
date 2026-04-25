import type {
  CreateOrUpdateUserDietaryRequest,
  CreateOrUpdateUserDietaryResponse,
} from '@features/user/types/userDietary';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateUserDietary = (): {
  mutateAsync: (data: CreateOrUpdateUserDietaryRequest) => Promise<CreateOrUpdateUserDietaryResponse>;
  isPending: boolean;
  isError: boolean;
} => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (data: CreateOrUpdateUserDietaryRequest) =>
      axiosApi.userDietaryApi.createOrUpdateUserDietaryPreferences(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dietary.userPreferences });
    },
  });

  return { mutateAsync, isPending, isError };
};
