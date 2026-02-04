import {
  UserDietary,
  CreateOrUpdateUserDietaryRequest,
  CreateOrUpdateUserDietaryResponse,
} from '@features/user/types//userDietary';
import { axiosApi } from '@lib/api/apiInstance';

export default function useUserDietary(): {
  getUserDietaryPreferences: () => Promise<UserDietary[]>;
  createOrUpdateUserDietaryPreferences: (
    data: CreateOrUpdateUserDietaryRequest
  ) => Promise<CreateOrUpdateUserDietaryResponse>;
} {
  const getUserDietaryPreferences = async (): Promise<UserDietary[]> => {
    const userDietaryPreferences: UserDietary[] =
      await axiosApi.userDietaryApi.getUserDietaryPreferences();
    return userDietaryPreferences;
  };
  const createOrUpdateUserDietaryPreferences = async (
    data: CreateOrUpdateUserDietaryRequest
  ): Promise<CreateOrUpdateUserDietaryResponse> => {
    const response: CreateOrUpdateUserDietaryResponse =
      await axiosApi.userDietaryApi.createOrUpdateUserDietaryPreferences(data);
    return response;
  };

  return {
    getUserDietaryPreferences,
    createOrUpdateUserDietaryPreferences,
  };
}
