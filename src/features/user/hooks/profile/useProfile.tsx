import { User } from '@custom-types/user';
import { useAppDispatch } from '@hooks/reduxHooks';
import { markUserInfoSetup, updateProfile } from '@slices/auth';
import { useCallback } from 'react';

export default function useProfile(): {
  updateUserProfile: (data: Partial<User>) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const updateUserProfile = useCallback(
    async (data: Partial<User>): Promise<void> => {
      const updatedUser = await dispatch(updateProfile(data)).unwrap();
      if (!updatedUser?.userInfoSetup) await dispatch(markUserInfoSetup());
    },
    [dispatch]
  );

  return {
    updateUserProfile,
  };
}
