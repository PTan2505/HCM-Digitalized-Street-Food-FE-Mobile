import type {
  UserDietary,
  CreateOrUpdateUserDietaryRequest,
  CreateOrUpdateUserDietaryResponse,
} from '@features/user/types/userDietary';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createOrUpdateUserDietaryPreferences,
  getUserDietaryPreferences,
} from '@slices/dietary';
import { useCallback } from 'react';

export default function useUserDietary(): {
  onGetUserDietaryPreferences: () => Promise<UserDietary[]>;
  onCreateOrUpdateUserDietaryPreferences: (
    data: CreateOrUpdateUserDietaryRequest
  ) => Promise<CreateOrUpdateUserDietaryResponse>;
} {
  const dispatch = useAppDispatch();

  const onGetUserDietaryPreferences = useCallback(async (): Promise<
    UserDietary[]
  > => {
    const response = await dispatch(getUserDietaryPreferences()).unwrap();
    return response;
  }, [dispatch]);

  const onCreateOrUpdateUserDietaryPreferences = useCallback(
    async (
      data: CreateOrUpdateUserDietaryRequest
    ): Promise<CreateOrUpdateUserDietaryResponse> => {
      const response = await dispatch(
        createOrUpdateUserDietaryPreferences(data)
      ).unwrap();
      return response;
    },
    [dispatch]
  );

  return {
    onGetUserDietaryPreferences,
    onCreateOrUpdateUserDietaryPreferences,
  };
}
