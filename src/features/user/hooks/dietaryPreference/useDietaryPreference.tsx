import type { DietaryPreference } from '@features/user/types/dietaryPreference';
import { useDietaryPreferenceQuery } from './useDietaryPreferenceQuery';

export default function useDietaryPreference(): {
  onGetAllDietaryPreferences: () => Promise<DietaryPreference[]>;
} {
  const { dietaryPreferences } = useDietaryPreferenceQuery();

  const onGetAllDietaryPreferences = async (): Promise<DietaryPreference[]> => {
    return dietaryPreferences;
  };

  return { onGetAllDietaryPreferences };
}
