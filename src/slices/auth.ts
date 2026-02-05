import type { RootState } from '@app/store';
import type {
  ForgetPasswordRequest,
  ResendForgetPasswordOTPRequest,
  ResetPasswordRequest,
} from '@auth/types/forgetPassword';
import type { LoginRequest, LoginResponse } from '@auth/types/login';
import type {
  RegisterRequest,
  ResendRegistrationOTPRequest,
  VerifyRegistrationRequest,
} from '@auth/types/register';
import type { User } from '@custom-types/user';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { createSlice } from '@reduxjs/toolkit';
import { tokenManagement } from '@utils/tokenManagement';
import { Platform } from 'react-native';
import {
  AccessToken,
  AuthenticationToken,
  LoginManager,
} from 'react-native-fbsdk-next';

export interface AuthState {
  value: User | null;
  loginResponse: LoginResponse | null;
  registerEmail: string | null;
  forgetPasswordEmail: string | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: AuthState = {
  value: null,
  loginResponse: null,
  registerEmail: null,
  forgetPasswordEmail: null,
  status: 'idle',
  error: null,
};

export const userLogin = createAppAsyncThunk(
  'auth/login',
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      const loginResponse = await axiosApi.loginApi.login(payload);
      await tokenManagement.setTokens({ newAccessToken: loginResponse.token });

      const userProfile = await axiosApi.userProfileApi.getUserProfile();

      return { loginResponse, userProfile };
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'LOGIN_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during login',
      });
    }
  }
);

export const userLoginWithGoogle = createAppAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google');
      }
      console.log(userInfo.data?.idToken);

      const { token } = await axiosApi.loginApi.loginWithGoogle({
        idToken: userInfo.data.idToken,
      });

      await tokenManagement.setTokens({ newAccessToken: token });
      const userProfile = await axiosApi.userProfileApi.getUserProfile();

      return { userProfile };
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            return rejectWithValue({
              code: 'CANCELLED',
              message: 'User cancelled the login flow',
            });

          case statusCodes.IN_PROGRESS:
            return rejectWithValue({
              code: 'IN_PROGRESS',
              message: 'Sign in is already in progress',
            });

          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            return rejectWithValue({
              code: 'PLAY_SERVICES_NOT_AVAILABLE',
              message: 'Google Play Services are not available or outdated',
            });

          default:
            return rejectWithValue({
              code: 'GOOGLE_SIGN_IN_ERROR',
              message: error.message || 'Google Sign-In failed',
            });
        }
      }

      // Handle API errors or other errors
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'API_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during Google login',
      });
    }
  }
);

export const userLoginWithFacebook = createAppAsyncThunk(
  'auth/loginWithFacebook',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Request 'email' permission alongside 'public_profile'
      // 'limited' mode is safer for iOS compliance (no tracking consent needed)
      const result = await LoginManager.logInWithPermissions(
        ['public_profile', 'email'],
        'limited'
      );

      if (result.isCancelled) {
        return rejectWithValue({
          code: 'CANCELLED',
          message: 'User cancelled Facebook login',
        });
      }

      // 2. Platform-Specific Token Retrieval
      let tokenString: string | undefined;

      if (Platform.OS === 'ios') {
        // iOS: Get the OIDC JWT (AuthenticationToken)
        // This avoids the "Invalid Token" / Year 4001 expiration issue
        const authToken = await AuthenticationToken.getAuthenticationTokenIOS();
        tokenString = authToken?.authenticationToken;
      } else {
        // Android: Get the Standard Graph Access Token
        const accessTokenData = await AccessToken.getCurrentAccessToken();
        tokenString = accessTokenData?.accessToken;
      }

      if (!tokenString) {
        throw new Error('Failed to retrieve a valid token from Facebook');
      }

      console.log(`Sending ${Platform.OS} token to Backend:`, tokenString);

      // 3. Call Backend API
      const { token } = await axiosApi.loginApi.loginWithFacebook({
        accessToken: tokenString,
      });
      await tokenManagement.setTokens({ newAccessToken: token });
      const userProfile = await axiosApi.userProfileApi.getUserProfile();
      return { userProfile };
    } catch (error) {
      console.log('Facebook sign-in error:', error);

      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'API_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'FACEBOOK_LOGIN_ERROR',
        message: 'An unexpected error occurred during Facebook login',
      });
    }
  }
);

export const userLoginWithPhoneNumber = createAppAsyncThunk(
  'auth/loginWithPhoneNumber',
  async (payload: { phoneNumber: string }, { rejectWithValue }) => {
    try {
      const response = await axiosApi.loginApi.loginWithPhoneNumber({
        phoneNumber: payload.phoneNumber,
      });
      console.log('Phone login response:', response);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'PHONE_LOGIN_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during phone login',
      });
    }
  }
);

export const verifyPhoneNumber = createAppAsyncThunk(
  'auth/verifyPhoneNumber',
  async (
    payload: { phoneNumber: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const { token } = await axiosApi.loginApi.verifyPhoneNumber({
        phoneNumber: payload.phoneNumber,
        otp: payload.otp,
      });
      await tokenManagement.setTokens({ newAccessToken: token });
      const userProfile = await axiosApi.userProfileApi.getUserProfile();

      return { userProfile };
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'PHONE_VERIFY_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during phone verification',
      });
    }
  }
);

export const loadUserFromStorage = createAppAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await tokenManagement.getAccessToken();
      if (!accessToken) {
        await tokenManagement.clearTokens();
        return rejectWithValue({
          code: 'NO_TOKEN',
          message: 'No access token found',
        });
      }

      const userProfile = await axiosApi.userProfileApi.getUserProfile();
      return userProfile;
    } catch (error) {
      await tokenManagement.clearTokens();

      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'LOAD_USER_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load user from storage',
      });
    }
  }
);

export const userRegister = createAppAsyncThunk(
  'auth/register',
  async (payload: RegisterRequest, { rejectWithValue }) => {
    try {
      const registerResponse = await axiosApi.registerApi.register(payload);
      return registerResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        const apiError = error as {
          message: string;
          fieldErrors?: Record<string, string[]>;
        };
        return rejectWithValue({
          code: 'REGISTER_ERROR',
          message: apiError.message,
          fieldErrors: apiError.fieldErrors,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during registration',
      });
    }
  }
);

export const verifyRegistration = createAppAsyncThunk(
  'auth/verifyRegistration',
  async (payload: VerifyRegistrationRequest, { rejectWithValue }) => {
    try {
      const verifyResponse =
        await axiosApi.registerApi.verifyRegistration(payload);
      return verifyResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'VERIFY_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to verify registration',
      });
    }
  }
);

export const resendRegistrationOTP = createAppAsyncThunk(
  'auth/resendRegistrationOTP',
  async (payload: ResendRegistrationOTPRequest, { rejectWithValue }) => {
    try {
      const resendResponse =
        await axiosApi.registerApi.resendRegistrationOTP(payload);
      return resendResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'RESEND_OTP_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to resend registration OTP',
      });
    }
  }
);

export const forgetPassword = createAppAsyncThunk(
  'auth/forgetPassword',
  async (payload: ForgetPasswordRequest, { rejectWithValue }) => {
    try {
      const forgetPasswordResponse =
        await axiosApi.forgetPasswordApi.forgetPassword(payload);
      return forgetPasswordResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'FORGET_PASSWORD_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to process forgot password request',
      });
    }
  }
);

export const resetPassword = createAppAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      const resetPasswordResponse =
        await axiosApi.forgetPasswordApi.resetPassword(payload);
      return resetPasswordResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'RESET_PASSWORD_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to reset password',
      });
    }
  }
);

export const resendForgetPasswordOTP = createAppAsyncThunk(
  'auth/resendForgetPasswordOTP',
  async (payload: ResendForgetPasswordOTPRequest, { rejectWithValue }) => {
    try {
      const resendResponse =
        await axiosApi.forgetPasswordApi.resendForgetPasswordOTP(payload);
      return resendResponse;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'RESEND_OTP_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to resend forgot password OTP',
      });
    }
  }
);

export const userLogout = createAppAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Sign out from Google
      try {
        await GoogleSignin.signOut();
        console.log('gg');
      } catch (googleError) {
        console.log('Google signOut failed:', googleError);
      }

      // Sign out from Facebook
      try {
        LoginManager.logOut();
        console.log('facebook logout success');
      } catch (facebookError) {
        console.log('Facebook logout failed:', facebookError);
      }

      await tokenManagement.clearTokens();

      return null;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        return rejectWithValue({
          code: 'LOGOUT_ERROR',
          message: (error as { message: string }).message,
        });
      }

      return rejectWithValue({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to logout',
      });
    }
  }
);

export const authSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegisterEmail: (state) => {
      state.registerEmail = null;
    },
    clearForgetPasswordEmail: (state) => {
      state.forgetPasswordEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(userLogin.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload.userProfile;
        state.loginResponse = action.payload.loginResponse;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Login failed' };
      })
      // Google login cases
      .addCase(userLoginWithGoogle.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(userLoginWithGoogle.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload.userProfile;
      })
      .addCase(userLoginWithGoogle.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Google login failed' };
      })
      // Facebook login cases
      .addCase(userLoginWithFacebook.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(userLoginWithFacebook.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.value = action.payload.userProfile;
        }
      })
      .addCase(userLoginWithFacebook.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Facebook login failed' };
      })
      // Phone number login cases
      .addCase(userLoginWithPhoneNumber.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(userLoginWithPhoneNumber.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(userLoginWithPhoneNumber.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Phone login failed' };
      })
      // Phone number verify cases
      .addCase(verifyPhoneNumber.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(verifyPhoneNumber.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.value = action.payload.userProfile;
        }
      })
      .addCase(verifyPhoneNumber.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Phone verify failed' };
      })
      // Load user from storage cases
      .addCase(loadUserFromStorage.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Load user failed' };
        state.value = null;
      })
      // Register cases
      .addCase(userRegister.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.registerEmail = action.payload.email;
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Register failed' };
      })
      // Verify registration cases
      .addCase(verifyRegistration.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(verifyRegistration.fulfilled, (state) => {
        state.status = 'succeeded';
        state.registerEmail = null;
      })
      .addCase(verifyRegistration.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? {
          message: 'Verify registration failed',
        };
      })
      // Resend registration OTP cases
      .addCase(resendRegistrationOTP.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(resendRegistrationOTP.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.registerEmail = action.payload.email;
      })
      .addCase(resendRegistrationOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? {
          message: 'Resend registration OTP failed',
        };
      })
      // Forget password cases
      .addCase(forgetPassword.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.forgetPasswordEmail = action.payload.email;
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Forget password failed' };
      })
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.forgetPasswordEmail = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Reset password failed' };
      })
      // Resend forget password OTP cases
      .addCase(resendForgetPasswordOTP.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(resendForgetPasswordOTP.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.forgetPasswordEmail = action.payload.email;
      })
      .addCase(resendForgetPasswordOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? {
          message: 'Resend forget password OTP failed',
        };
      })
      // Logout cases
      .addCase(userLogout.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(userLogout.fulfilled, () => {
        return initialState;
      })
      .addCase(userLogout.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Logout failed' };
      });
  },
});

// Action creators are generated for each case reducer function
export const { clearError, clearRegisterEmail, clearForgetPasswordEmail } =
  authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectUser = (state: RootState): User | null => state.user.value;

export const selectLoginResponse = (state: RootState): LoginResponse | null =>
  state.user.loginResponse;

export const selectRegisterEmail = (state: RootState): string | null =>
  state.user.registerEmail;

export const selectForgetPasswordEmail = (state: RootState): string | null =>
  state.user.forgetPasswordEmail;

export const selectUserStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.user.status;

export const selectAuthError = (state: RootState): unknown => state.user.error;
