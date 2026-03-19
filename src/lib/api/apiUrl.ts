export const apiUrl = {
  auth: {
    facebookLogin: '/api/Auth/facebook-login',
    phoneLogin: '/api/Auth/phone-login',
    phoneVerify: '/api/Auth/phone-verify',
    login: '/api/Auth/login',
    googleLogin: '/api/Auth/google-login',
    profile: '/api/Auth/profile',
    register: '/api/Auth/register',
    verifyRegistration: '/api/Auth/verify-registration',
    resendRegistrationOTP: '/api/Auth/resend-registration-otp',
    forgetPassword: '/api/Auth/forget-password',
    resetPassword: '/api/Auth/reset-password',
    resendForgetPasswordOTP: '/api/Auth/resend-forget-password-otp',
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
  },
  branch: {
    active: '/api/Branch/active',
    byVendor: '/api/Branch/vendor',
    workSchedules: (id: number): string => `/api/Branch/${id}/work-schedules`,
  },
  userDietary: {
    userDietary: '/api/UserDietary/user',
  },
  user: {
    userSetup: {
      userinfo: '/api/UserSetup/userinfo-setup',
      dietary: '/api/UserSetup/dietary-setup',
    },
  },
  ghostPin: {
    create: '/api/GhostPin',
  },
  cart: {
    my: '/api/Cart/my',
    items: '/api/Cart/items',
    itemByDish: (dishId: number): string => `/api/Cart/items/${dishId}`,
    clear: '/api/Cart/clear',
    checkout: '/api/Cart/checkout',
  },
  order: {
    byId: (id: number): string => `/api/Order/${id}`,
    myOrders: '/api/Order/my-orders',
    pickupCode: (id: number): string => `/api/Order/${id}/pickup-code`,
  },
};
