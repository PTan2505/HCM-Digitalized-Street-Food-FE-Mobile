import { AxiosApiService } from '@config/axiosApiService';
import { LoginApi } from '@features/auth/api/loginApi';
import { VoucherApi } from '@features/campaigns/api/voucherApi';
import {
  CartApi,
  OrderApi,
  PaymentApi,
} from '@features/direct-ordering/api/cartApi';
import { BranchApi } from '@features/home/api/branchApi';
import { CategoryApi } from '@features/home/api/categoryApi';
import { FeedbackApi } from '@features/home/api/feedbackApi';
import { FeedbackTagApi } from '@features/home/api/feedbackTagApi';
import { StallSearchApi } from '@features/home/api/stallSearchApi';
import { TasteApi } from '@features/home/api/tasteApi';
import { VendorApi } from '@features/home/api/vendorApi';
import { GhostPinApi } from '@features/maps/api/ghostPinApi';
import { NotificationApi } from '@features/notifications/api/notificationApi';
import { QuestApi } from '@features/quests/api/questApi';
import { UserPaymentApi } from '@features/user/api/paymentApi';
import { UserProfileApi } from '@features/user/api/profileApi';

import { DietaryPreferenceApi } from '@features/user/api/dietaryPreferenceApi';
import { UserDietaryApi } from '@features/user/api/userDietaryApi';
import ApiClient from '@lib/api/apiClient';
import { SettingsApi } from '@lib/api/settingsApi';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  loginApi: new LoginApi(axiosClient),
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
  paymentApi: new PaymentApi(axiosClient),
  notificationApi: new NotificationApi(axiosClient),
  questApi: new QuestApi(axiosClient),
  voucherApi: new VoucherApi(axiosClient),
  userPaymentApi: new UserPaymentApi(axiosClient),
  settingsApi: new SettingsApi(axiosClient),
};
