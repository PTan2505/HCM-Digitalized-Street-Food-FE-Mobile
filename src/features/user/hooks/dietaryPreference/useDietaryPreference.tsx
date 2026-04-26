import type { DietaryPreference } from '@features/user/types/dietaryPreference';
import { useDietaryPreferenceQuery } from './useDietaryPreferenceQuery';

export default function useDietaryPreference(): {
  onGetAllDietaryPreferences: () => Promise<DietaryPreference[]>;
} {
  const { dietaryPreferences } = useDietaryPreferenceQuery();

  const onGetAllDietaryPreferences = (): Promise<DietaryPreference[]> => {
    return Promise.resolve(dietaryPreferences);
  };

  return { onGetAllDietaryPreferences };
}
