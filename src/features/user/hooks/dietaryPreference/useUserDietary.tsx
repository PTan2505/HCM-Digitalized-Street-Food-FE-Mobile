import type {
  CreateOrUpdateUserDietaryRequest,
  CreateOrUpdateUserDietaryResponse,
  UserDietary,
} from '@features/user/types/userDietary';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { markDietarySetup, selectUser } from '@slices/auth';
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
  const user = useAppSelector(selectUser);

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
      if (!user?.dietarySetup) {
        console.log('a');
        await dispatch(markDietarySetup());
      }
      return response;
    },
    [dispatch, user]
  );

  return {
    onGetUserDietaryPreferences,
    onCreateOrUpdateUserDietaryPreferences,
  };
}
