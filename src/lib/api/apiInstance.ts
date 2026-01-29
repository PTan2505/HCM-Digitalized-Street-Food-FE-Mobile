import { AxiosApiService } from '@config/axiosApiService';
import { RegisterApi } from '@features/auth/api/registerApi';
import { LoginApi } from '@features/auth/api/loginApi';
import { ForgetPasswordApi } from '@features/auth/api/forgetPasswordApi';
import { UserProfileApi } from '@features/user/api/profileApi';

import ApiClient from '@lib/api/apiClient';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  loginApi: new LoginApi(axiosClient),
  registerApi: new RegisterApi(axiosClient),
  forgetPasswordApi: new ForgetPasswordApi(axiosClient),
  userProfileApi: new UserProfileApi(axiosClient),
};
