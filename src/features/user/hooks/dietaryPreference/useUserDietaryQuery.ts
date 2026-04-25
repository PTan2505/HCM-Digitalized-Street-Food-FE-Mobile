import type { UserDietary } from '@features/user/types/userDietary';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useUserDietaryQuery = (): {
  userDietaryPreferences: UserDietary[];
  isLoading: boolean;
  isError: boolean;
} => {
  const { data: userDietaryPreferences = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.dietary.userPreferences,
    queryFn: () => axiosApi.userDietaryApi.getUserDietaryPreferences(),
    staleTime: 5 * 60 * 1000,
  });

  return { userDietaryPreferences, isLoading, isError };
};
