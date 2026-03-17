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
    byBranch: (branchId: number) => `/Feedback/branch/${branchId}`,
    averageRating: (branchId: number) =>
      `/Feedback/branch/${branchId}/average-rating`,
    count: (branchId: number) => `/Feedback/branch/${branchId}/count`,
    ratingRange: (branchId: number) =>
      `/Feedback/branch/${branchId}/rating-range`,
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
    workSchedules: (id: number) => `/Branch/${id}/work-schedules`,
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
