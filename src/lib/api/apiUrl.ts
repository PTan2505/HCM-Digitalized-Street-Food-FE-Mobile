export const apiUrl = {
  ai: {
    chat: '/api/Ai/chat',
  },
  auth: {
    facebookLogin: '/api/Auth/facebook-login',
    phoneLogin: '/api/Auth/phone-login',
    phoneVerify: '/api/Auth/phone-verify',
    login: '/api/Auth/login',
    googleLogin: '/api/Auth/google-login',
    contactVerification: '/api/Auth/contact-verification',
  },
  dietaryPreference: {
    getAll: '/api/DietaryPreference',
  },
  taste: {
    getAll: '/api/tastes',
  },
  feedback: {
    // CRUD
    submit: '/api/Feedback',
    byId: (id: number): string => `/api/Feedback/${id}`,
    // Listing
    byBranch: (branchId: number): string => `/api/Feedback/branch/${branchId}`,
    byRatingRange: (branchId: number): string =>
      `/api/Feedback/branch/${branchId}/rating-range`,
    byUser: (userId: number): string => `/api/Feedback/user/${userId}`,
    myFeedback: '/api/Feedback/my-feedback',
    // Stats
    averageRating: (branchId: number): string =>
      `/api/Feedback/branch/${branchId}/average-rating`,
    count: (branchId: number): string =>
      `/api/Feedback/branch/${branchId}/count`,
    // Images
    images: (feedbackId: number): string =>
      `/api/Feedback/${feedbackId}/images`,
    imageById: (feedbackId: number, imageId: number): string =>
      `/api/Feedback/${feedbackId}/images/${imageId}`,
    // Voting
    vote: (feedbackId: number): string => `/api/Feedback/${feedbackId}/vote`,
    // Vendor reply
    reply: (feedbackId: number): string => `/api/Feedback/${feedbackId}/reply`,
    // Velocity
    velocityCheck: '/api/Feedback/velocity/check',
  },
  feedbackTag: {
    getAll: '/api/FeedbackTag',
  },
  category: {
    getAll: '/api/categories',
  },
  vendor: {
    getAll: '/api/Vendor',
    byId: (id: number): string => `/api/Vendor/${id}`,
  },
  search: {
    vendorWithBranch: '/api/searchVendorWithBranch',
  },
  branch: {
    active: '/api/Branch/active',
    byId: (id: number): string => `/api/Branch/${id}`,
    byVendor: '/api/Branch/vendor',
    workSchedules: (id: number): string => `/api/Branch/${id}/work-schedules`,
    workScheduleById: (id: number): string =>
      `/api/Branch/work-schedules/${id}`,
    dayOffs: (id: number): string => `/api/Branch/${id}/day-offs`,
    images: (branchId: number): string => `/api/Branch/${branchId}/images`,
    similar: (branchId: number): string => `/api/Branch/${branchId}/similar`,
    myGhostPins: '/api/Branch/my-ghost-pin',
    allGhostPins: '/api/Branch/all-ghost-pins',
  },
  userDietary: {
    userDietary: '/api/UserDietary/user',
  },
  badge: {
    user: '/api/Badge/user',
    select: (badgeId: number): string => `/api/Badge/user/select/${badgeId}`,
    clearSelect: '/api/Badge/user/select',
  },
  user: {
    profile: '/api/User/profile',
    avatar: '/api/User/profile/avatar',
    byId: (id: number): string => `/api/User/${id}`,
    verifyOtp: '/api/User/profile/verify-otp',
    userSetup: {
      userinfo: '/api/UserSetup/userinfo-setup',
      dietary: '/api/UserSetup/dietary-setup',
    },
    pin: {
      status: '/api/user/pin/status',
      set: '/api/user/pin/set',
      verify: '/api/user/pin/verify',
      change: '/api/user/pin/change',
      remove: '/api/user/pin/remove',
    },
  },
  ghostPin: {
    create: '/api/Branch/user',
  },
  dish: {
    byBranch: (branchId: number): string => `/api/dishes/branch/${branchId}`,
    byVendor: (vendorId: number): string => `/api/dishes/vendor/${vendorId}`,
    availability: (dishId: number, branchId: number): string =>
      `/api/dishes/${dishId}/branch/${branchId}/availability`,
  },
  cart: {
    my: '/api/Cart/my',
    myBranch: (branchId: number): string => `/api/Cart/my/branches/${branchId}`,
    items: '/api/Cart/items',
    itemByDish: (dishId: number): string => `/api/Cart/items/${dishId}`,
    clear: '/api/Cart/clear',
    checkout: '/api/Cart/checkout',
  },
  order: {
    byId: (id: number): string => `/api/Order/${id}`,
    myOrders: '/api/Order/my-orders',
    pickupCode: (id: number): string => `/api/Order/${id}/pickup-code`,
    cancel: (id: number): string => `/api/Order/${id}/cancel`,
  },
  managerOrder: {
    list: '/api/Order/manager/orders',
    vendorList: '/api/order/vendor/orders',
    vendorBranchList: (branchId: number): string =>
      `/api/Order/vendor/branches/${branchId}/orders`,
    decision: (id: number): string => `/api/order/vendor/orders/${id}/decision`,
    complete: (id: number): string => `/api/order/vendor/orders/${id}/complete`,
  },
  vendorBranch: {
    me: '/api/Vendor/my-vendor',
    byId: (branchId: number): string => `/api/Branch/${branchId}`,
    branchAssignments: (branchId: number): string =>
      `/api/branch/${branchId}/dish-assignments`,
    dietaryPreferences: (vendorId: number): string =>
      `/api/Vendor/${vendorId}/dietary-preferences`,
    updateMyDietaryPreferences: '/api/Vendor/my-vendor/dietary-preferences',
    claimBranch: '/api/Vendor/claim-branch',
    registerVendor: '/api/Vendor',
    createBranchForVendor: (vendorId: number): string =>
      `/api/Branch/vendor/${vendorId}`,
    submitLicense: (branchId: number): string =>
      `/api/Branch/${branchId}/submit-license`,
    submitImages: (branchId: number): string =>
      `/api/Branch/${branchId}/images`,
  },
  dashboard: {
    revenue: '/api/VendorDashboard/revenue',
    vouchers: '/api/VendorDashboard/vouchers',
    dishes: '/api/VendorDashboard/dishes',
    campaigns: '/api/VendorDashboard/campaigns',
  },
  vendorCampaign: {
    vendorList: '/api/campaign/vendor',
    create: '/api/campaign/vendor',
    byId: (id: number): string => `/api/campaign/${id}`,
    update: (id: number): string => `/api/campaign/${id}`,
    systemJoinable: '/api/campaign/system/joinable',
    systemById: (id: number): string => `/api/campaign/system/${id}`,
    joinSystem: (id: number): string =>
      `/api/Campaign/join/system/${id}/branch`,
    vendorCampaignBranches: (id: number): string =>
      `/api/Campaign/vendor/${id}/branches`,
    systemCampaignBranches: (id: number): string =>
      `/api/Campaign/system/${id}/branches`,
    addBranchesToCampaign: (id: number): string =>
      `/api/Campaign/vendor/${id}/branches/add`,
    removeBranchesFromCampaign: (id: number): string =>
      `/api/Campaign/vendor/${id}/branches/remove`,
  },
  payment: {
    orderConfirm: '/api/Payment/order/confirm',
    userTransfer: '/api/Payment/user/transfer',
    history: '/api/Payment/history',
    vendorHistory: '/api/Payment/vendor/history',
    createLink: '/api/Payment/create-link',
  },
  notification: {
    registerToken: '/api/notifications/register-token',
    removeToken: '/api/notifications/remove-token',
    list: '/api/notifications',
    unreadCount: '/api/notifications/unread-count',
    markRead: (id: number): string => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',
  },
  setting: {
    getAll: '/api/Setting',
  },
  voucher: {
    mine: '/api/vouchers/mine',
    marketplace: '/api/vouchers/marketplace',
    base: '/api/vouchers',
    byId: (id: number): string => `/api/vouchers/${id}`,
    claim: (id: number): string => `/api/vouchers/${id}/claim`,
    applicableByBranch: (branchId: number): string =>
      `/api/vouchers/mine/branch/${branchId}`,
    byCampaign: (campaignId: number): string =>
      `/api/vouchers/campaign/${campaignId}`,
  },
  vendorCampaignImage: {
    images: (id: number): string => `/api/Campaign/${id}/images`,
    image: (id: number): string => `/api/Campaign/${id}/image`,
  },
  tier: {
    getAll: '/api/Tier',
  },
};
