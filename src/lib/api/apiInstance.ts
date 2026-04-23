import { AxiosApiService } from '@config/axiosApiService';
import { LoginApi } from '@features/auth/api/loginApi';
import { VoucherApi } from '@features/customer/campaigns/api/voucherApi';
import {
  CartApi,
  OrderApi,
  PaymentApi,
} from '@features/customer/direct-ordering/api/cartApi';
import { BranchApi } from '@features/customer/home/api/branchApi';
import { CategoryApi } from '@features/customer/home/api/categoryApi';
import { FeedbackApi } from '@features/customer/home/api/feedbackApi';
import { FeedbackTagApi } from '@features/customer/home/api/feedbackTagApi';
import { StallSearchApi } from '@features/customer/home/api/stallSearchApi';
import { TasteApi } from '@features/customer/home/api/tasteApi';
import { VendorApi } from '@features/customer/home/api/vendorApi';
import { GhostPinApi } from '@features/customer/maps/api/ghostPinApi';
import { QuestApi } from '@features/customer/quests/api/questApi';
import { ManagerBranchApi } from '@features/manager/branch/managerBranchApi';
import { ManagerFeedbackApi } from '@features/manager/feedback/api/managerFeedbackApi';
import { ManagerOrderApi } from '@features/manager/orders/api/managerOrderApi';
import { NotificationApi } from '@features/notifications/api/notificationApi';
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
  managerBranchApi: new ManagerBranchApi(axiosClient),
  managerOrderApi: new ManagerOrderApi(axiosClient),
  managerFeedbackApi: new ManagerFeedbackApi(axiosClient),
};
