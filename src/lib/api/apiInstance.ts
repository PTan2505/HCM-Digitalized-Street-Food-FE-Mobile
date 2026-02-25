import { AxiosApiService } from '@config/axiosApiService';
import { ForgetPasswordApi } from '@features/auth/api/forgetPasswordApi';
import { LoginApi } from '@features/auth/api/loginApi';
import { RegisterApi } from '@features/auth/api/registerApi';
import { UserProfileApi } from '@features/user/api/profileApi';

import { DietaryPreferenceApi } from '@features/user/api/dietaryPreferenceApi';
import { UserDietaryApi } from '@features/user/api/userDietaryApi';
import ApiClient from '@lib/api/apiClient';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  loginApi: new LoginApi(axiosClient),
  registerApi: new RegisterApi(axiosClient),
  forgetPasswordApi: new ForgetPasswordApi(axiosClient),
  userProfileApi: new UserProfileApi(axiosClient),
  dietaryPreferenceApi: new DietaryPreferenceApi(axiosClient),
  userDietaryApi: new UserDietaryApi(axiosClient),
};
