export const apiUrl = {
  auth: {
    facebookLogin: '/Auth/facebook-login',
    phoneLogin: '/Auth/phone-login',
    phoneVerify: '/Auth/phone-verify',
    login: '/Auth/login',
    googleLogin: '/Auth/google-login',
    profile: '/Auth/profile',
    register: '/Auth/register',
    verifyRegistration: '/Auth/verify-registration',
    resendRegistrationOTP: '/Auth/resend-registration-otp',
    forgetPassword: '/Auth/forget-password',
    resetPassword: '/Auth/reset-password',
    resendForgetPasswordOTP: '/Auth/resend-forget-password-otp',
  },
  dietaryPreference: {
    getAll: '/DietaryPreference',
  },
  taste: {
    getAll: '/tastes',
  },
  feedback: {
    // CRUD
    submit: '/Feedback',
    byId: (id: number): string => `/Feedback/${id}`,
    // Listing
    byBranch: (branchId: number): string => `/Feedback/branch/${branchId}`,
    byRatingRange: (branchId: number): string =>
      `/Feedback/branch/${branchId}/rating-range`,
    byUser: (userId: number): string => `/Feedback/user/${userId}`,
    myFeedback: '/Feedback/my-feedback',
    // Stats
    averageRating: (branchId: number): string =>
      `/Feedback/branch/${branchId}/average-rating`,
    count: (branchId: number): string => `/Feedback/branch/${branchId}/count`,
    // Images
    images: (feedbackId: number): string => `/Feedback/${feedbackId}/images`,
    imageById: (feedbackId: number, imageId: number): string =>
      `/Feedback/${feedbackId}/images/${imageId}`,
    // Voting
    vote: (feedbackId: number): string => `/Feedback/${feedbackId}/vote`,
    // Vendor reply
    reply: (feedbackId: number): string => `/Feedback/${feedbackId}/reply`,
    // Velocity
    velocityCheck: '/Feedback/velocity/check',
  },
  feedbackTag: {
    getAll: '/FeedbackTag',
  },
  category: {
    getAll: '/categories',
  },
  vendor: {
    getAll: '/Vendor',
  },
  branch: {
    active: '/Branch/active',
    byVendor: '/Branch/vendor',
    workSchedules: (id: number): string => `/Branch/${id}/work-schedules`,
  },
  userDietary: {
    userDietary: '/UserDietary/user',
  },
  user: {
    userSetup: {
      userinfo: '/UserSetup/userinfo-setup',
      dietary: '/UserSetup/dietary-setup',
    },
  },
};
