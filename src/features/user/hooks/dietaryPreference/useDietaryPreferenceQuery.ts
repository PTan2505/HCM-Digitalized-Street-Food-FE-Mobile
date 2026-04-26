import type { DietaryPreference } from '@features/user/types/dietaryPreference';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useDietaryPreferenceQuery = (): {
  dietaryPreferences: DietaryPreference[];
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: dietaryPreferences = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.dietary.preferences,
    queryFn: () => axiosApi.dietaryPreferenceApi.getAllDietaryPreferences(),
    staleTime: 60 * 60 * 1000,
  });

  return { dietaryPreferences, isLoading, isError };
};
