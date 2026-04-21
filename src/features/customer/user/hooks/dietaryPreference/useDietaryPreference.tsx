import type { DietaryPreference } from '@features/customer/user/types/dietaryPreference';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getAllDietaryPreferences } from '@slices/dietary';
import { useCallback } from 'react';

export default function useDietaryPreference(): {
  onGetAllDietaryPreferences: () => Promise<DietaryPreference[]>;
} {
  const dispatch = useAppDispatch();

  const onGetAllDietaryPreferences = useCallback(async (): Promise<
    DietaryPreference[]
  > => {
    const response = await dispatch(getAllDietaryPreferences()).unwrap();
    return response;
  }, [dispatch]);

  return {
    onGetAllDietaryPreferences,
  };
}
