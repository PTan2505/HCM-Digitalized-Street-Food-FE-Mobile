import { AxiosApiService } from '@config/axiosApiService';
import { ChatApi } from '@features/customer/chatbot/api/chatApi';
import { VoucherApi } from '@customer/campaigns/api/voucherApi';
import {
  CartApi,
  OrderApi,
  PaymentApi,
} from '@customer/direct-ordering/api/cartApi';
import { BranchApi } from '@customer/home/api/branchApi';
import { CategoryApi } from '@customer/home/api/categoryApi';
import { FeedbackApi } from '@customer/home/api/feedbackApi';
import { FeedbackTagApi } from '@customer/home/api/feedbackTagApi';
import { StallSearchApi } from '@customer/home/api/stallSearchApi';
import { TierApi } from '@customer/home/api/tierApi';
import { TasteApi } from '@customer/home/api/tasteApi';
import { VendorApi } from '@customer/home/api/vendorApi';
import { GhostPinApi } from '@customer/maps/api/ghostPinApi';
import { QuestApi } from '@customer/quests/api/questApi';
import { LoginApi } from '@features/auth/api/loginApi';
import { NotificationApi } from '@features/notifications/api/notificationApi';
import { BadgeApi } from '@features/user/api/badgeApi';
import { DietaryPreferenceApi } from '@features/user/api/dietaryPreferenceApi';
import { UserPaymentApi } from '@features/user/api/paymentApi';
import { UserProfileApi } from '@features/user/api/profileApi';
import { UserDietaryApi } from '@features/user/api/userDietaryApi';
import { UserPinApi } from '@features/user/api/userPinApi';

import ApiClient from '@lib/api/apiClient';
import { SettingsApi } from '@lib/api/settingsApi';
import { ManagerBranchApi } from '@manager/branch/managerBranchApi';
import { ManagerPaymentApi } from '@manager/payment/api/managerPaymentApi';
import { ManagerCampaignApi } from '@manager/campaigns/api/managerCampaignApi';
import { ManagerVoucherApi } from '@manager/vouchers/api/managerVoucherApi';
import { ManagerDashboardApi } from '@manager/dashboard/api/managerDashboardApi';
import { ManagerDayOffApi } from '@manager/day-off/api/managerDayOffApi';
import { ManagerFeedbackApi } from '@manager/feedback/api/managerFeedbackApi';
import { ManagerDishApi } from '@manager/menu/api/managerDishApi';
import { ManagerOrderApi } from '@manager/orders/api/managerOrderApi';
import { ManagerScheduleApi } from '@manager/schedule/api/managerScheduleApi';
import { VendorBranchApi } from '@manager/vendor-branches/api/vendorBranchApi';

const axiosService = new AxiosApiService();
const axiosClient = new ApiClient(axiosService);

export const axiosApi = {
  chatApi: new ChatApi(axiosClient),
  loginApi: new LoginApi(axiosClient),
  userProfileApi: new UserProfileApi(axiosClient),
  badgeApi: new BadgeApi(axiosClient),
  dietaryPreferenceApi: new DietaryPreferenceApi(axiosClient),
  userDietaryApi: new UserDietaryApi(axiosClient),
  categoryApi: new CategoryApi(axiosClient),
  vendorApi: new VendorApi(axiosClient),
  branchApi: new BranchApi(axiosClient),
  stallSearchApi: new StallSearchApi(axiosClient),
  tierApi: new TierApi(axiosClient),
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
  userPinApi: new UserPinApi(axiosClient),
  settingsApi: new SettingsApi(axiosClient),
  managerBranchApi: new ManagerBranchApi(axiosClient),
  managerOrderApi: new ManagerOrderApi(axiosClient),
  managerFeedbackApi: new ManagerFeedbackApi(axiosClient),
  managerDishApi: new ManagerDishApi(axiosClient),
  managerScheduleApi: new ManagerScheduleApi(axiosClient),
  managerDayOffApi: new ManagerDayOffApi(axiosClient),
  vendorBranchApi: new VendorBranchApi(axiosClient),
  managerDashboardApi: new ManagerDashboardApi(axiosClient),
  managerCampaignApi: new ManagerCampaignApi(axiosClient),
  managerVoucherApi: new ManagerVoucherApi(axiosClient),
  managerPaymentApi: new ManagerPaymentApi(axiosClient),
};
