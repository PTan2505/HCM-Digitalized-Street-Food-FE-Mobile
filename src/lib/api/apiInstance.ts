import { AxiosApiService } from '@config/axiosApiService';
import { ForgetPasswordApi } from '@features/auth/api/forgetPasswordApi';
import { LoginApi } from '@features/auth/api/loginApi';
import { RegisterApi } from '@features/auth/api/registerApi';
import { BranchApi } from '@features/home/api/branchApi';
import { CategoryApi } from '@features/home/api/categoryApi';
import { FeedbackApi } from '@features/home/api/feedbackApi';
import { FeedbackTagApi } from '@features/home/api/feedbackTagApi';
import { StallSearchApi } from '@features/home/api/stallSearchApi';
import { TasteApi } from '@features/home/api/tasteApi';
import { VendorApi } from '@features/home/api/vendorApi';
import { CartApi, OrderApi } from '@features/direct-ordering/api/cartApi';
import { GhostPinApi } from '@features/maps/api/ghostPinApi';
import { NotificationApi } from '@features/notifications/api/notificationApi';
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
  categoryApi: new CategoryApi(axiosClient),
  vendorApi: new VendorApi(axiosClient),
  branchApi: new BranchApi(axiosClient),
  stallSearchApi: new StallSearchApi(axiosClient),
  tasteApi: new TasteApi(axiosClient),
  feedbackApi: new FeedbackApi(axiosClient),
  feedbackTagApi: new FeedbackTagApi(axiosClient),
  ghostPinApi: new GhostPinApi(axiosClient),
  cartApi: new CartApi(axiosClient),
  orderApi: new OrderApi(axiosClient),
  notificationApi: new NotificationApi(axiosClient),
};
