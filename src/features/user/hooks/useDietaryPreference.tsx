import { DietaryPreference } from '@features/user/types/dietaryPreference';
import { axiosApi } from '@lib/api/apiInstance';

export default function useDietaryPreference(): {
  getAllDietaryPreferences: () => Promise<DietaryPreference[]>;
} {
  const getAllDietaryPreferences = async (): Promise<DietaryPreference[]> => {
    const dietaryPreferences: DietaryPreference[] =
      await axiosApi.dietaryPreferenceApi.getAllDietaryPreferences();
    return dietaryPreferences;
  };

  return {
    getAllDietaryPreferences,
  };
}
