import type {
  CreateOrUpdateUserDietaryRequest,
  CreateOrUpdateUserDietaryResponse,
  UserDietary,
} from '@features/user/types/userDietary';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { markDietarySetup, selectUser } from '@slices/auth';
import { useCallback } from 'react';
import { useUpdateUserDietary } from './useUpdateUserDietary';
import { useUserDietaryQuery } from './useUserDietaryQuery';

export default function useUserDietary(): {
  onGetUserDietaryPreferences: () => Promise<UserDietary[]>;
  onCreateOrUpdateUserDietaryPreferences: (
    data: CreateOrUpdateUserDietaryRequest
  ) => Promise<CreateOrUpdateUserDietaryResponse>;
} {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { userDietaryPreferences } = useUserDietaryQuery();
  const { mutateAsync } = useUpdateUserDietary();

  const onGetUserDietaryPreferences = useCallback((): Promise<
    UserDietary[]
  > => {
    return Promise.resolve(userDietaryPreferences);
  }, [userDietaryPreferences]);

  const onCreateOrUpdateUserDietaryPreferences = useCallback(
    async (
      data: CreateOrUpdateUserDietaryRequest
    ): Promise<CreateOrUpdateUserDietaryResponse> => {
      const response = await mutateAsync(data);
      if (!user?.dietarySetup) {
        await dispatch(markDietarySetup());
      }
      return response;
    },
    [dispatch, mutateAsync, user]
  );

  return {
    onGetUserDietaryPreferences,
    onCreateOrUpdateUserDietaryPreferences,
  };
}
