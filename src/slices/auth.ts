import type { RootState } from '@customer-app/store';
import type { User } from '@custom-types/user';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  type PayloadAction,
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';
import { tokenManagement } from '@utils/tokenManagement';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  AccessToken,
  AuthenticationToken,
  LoginManager,
} from 'react-native-fbsdk-next';

export interface AuthState {
  value: User | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: AuthState = {
  value: null,
  status: 'idle',
  error: null,
};

const serializeError = (error: unknown): { code: string; message: string } => {
  if (error instanceof Error) {
    return { code: 'UNKNOWN_ERROR', message: error.message };
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return error as { code: string; message: string };
  }
  return { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' };
};

export const userLoginWithGoogle = createAppAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google');
      }

      const { user, token } = await axiosApi.loginApi.loginWithGoogle({
        idToken: userInfo.data.idToken,
      });

      await tokenManagement.setTokens({ newAccessToken: token });

      return { user };
    } catch (error) {
      // Handle Google SDK-specific errors
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

      return rejectWithValue(serializeError(error));
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

      // 3. Call Backend API
      const { user, token } = await axiosApi.loginApi.loginWithFacebook({
        accessToken: tokenString,
      });
      await tokenManagement.setTokens({ newAccessToken: token });
      return { user };
    } catch (error) {
      return rejectWithValue(serializeError(error));
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
      return rejectWithValue(serializeError(error));
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
      const { user, token } = await axiosApi.loginApi.verifyPhoneNumber({
        phoneNumber: payload.phoneNumber,
        otp: payload.otp,
      });
      await tokenManagement.setTokens({ newAccessToken: token });

      return { user };
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const loadUserFromStorage = createAppAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await tokenManagement.getAccessToken();
      console.log(accessToken);

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
      return rejectWithValue(serializeError(error));
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
      } catch {
        // Ignore Google signOut errors
      }

      // Sign out from Facebook
      try {
        LoginManager.logOut();
      } catch {
        // Ignore Facebook logout errors
      }

      // Remove push token from backend
      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        if (projectId) {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          await axiosApi.notificationApi.removePushToken({
            expoPushToken: tokenData.data,
          });
        }
      } catch {
        // Ignore push token removal errors
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

export const updateProfile = createAppAsyncThunk(
  'user/updateProfile',
  async (payload: Partial<User>, { rejectWithValue }) => {
    try {
      const user = await axiosApi.userProfileApi.updateUserProfile(payload);
      await axiosApi.userProfileApi.markUserInfoSetup();
      return user;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const markUserInfoSetup = createAppAsyncThunk(
  'user/markUserInfoSetup',
  async (_, { rejectWithValue }) => {
    try {
      await axiosApi.userProfileApi.markUserInfoSetup();
      return;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const markDietarySetup = createAppAsyncThunk(
  'user/markDietarySetup',
  async (_, { rejectWithValue }) => {
    try {
      await axiosApi.userProfileApi.markDietarySetup();
      return;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const refreshUserBalanceThunk = createAppAsyncThunk(
  'user/refreshBalance',
  async (_, { rejectWithValue }) => {
    try {
      const userProfile = await axiosApi.userProfileApi.getUserProfile();
      return userProfile.moneyBalance ?? 0;
    } catch (error) {
      return rejectWithValue(serializeError(error));
    }
  }
);

export const refreshUserPointsThunk = createAppAsyncThunk(
  'user/refreshPoints',
  async (_, { rejectWithValue }) => {
    try {
      const userProfile = await axiosApi.userProfileApi.getUserProfile();
      return userProfile.point ?? 0;
    } catch (error) {
      return rejectWithValue(serializeError(error));
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
    updateUserVerificationStatus: (
      state,
      action: PayloadAction<{ channel: string }>
    ) => {
      if (state.value) {
        if (action.payload.channel === 'email')
          state.value.emailVerified = true;
        if (action.payload.channel === 'phone')
          state.value.phoneNumberVerified = true;
      }
    },
    updateMoneyBalance: (state, action: PayloadAction<number>) => {
      if (state.value) {
        state.value.moneyBalance = action.payload;
      }
    },
    addPoints: (state, action: PayloadAction<number>) => {
      if (state.value) {
        state.value.point = (state.value.point ?? 0) + action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Các trường hợp thành công riêng biệt
      .addCase(userLoginWithGoogle.fulfilled, (state, action) => {
        state.value = action.payload.user;
      })
      .addCase(userLoginWithFacebook.fulfilled, (state, action) => {
        state.value = action.payload.user;
      })
      .addCase(verifyPhoneNumber.fulfilled, (state, action) => {
        state.value = action.payload.user;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(markUserInfoSetup.fulfilled, (state) => {
        if (state.value) {
          state.value.userInfoSetup = true;
        }
      })
      .addCase(markDietarySetup.fulfilled, (state) => {
        if (state.value) {
          state.value.dietarySetup = true;
        }
      })
      .addCase(refreshUserBalanceThunk.fulfilled, (state, action) => {
        if (state.value) {
          state.value.moneyBalance = action.payload;
        }
      })
      .addCase(refreshUserPointsThunk.fulfilled, (state, action) => {
        if (state.value) {
          state.value.point = action.payload;
        }
      })
      .addCase(userLogout.fulfilled, () => {
        return initialState;
      })

      // Matcher: Gom tất cả các case đang chạy (pending)
      .addMatcher(isPending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      // Matcher: Gom tất cả các case thất bại (rejected)
      .addMatcher(isRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'An error occurred' };
      })
      // Matcher: Gom các case thành công (ngoại trừ logout) để set status succeeded
      .addMatcher(
        (action) => isFulfilled(action) && !action.type.includes('logout'),
        (state) => {
          state.status = 'succeeded';
        }
      );
  },
});

// Action creators are generated for each case reducer function
export const {
  clearError,
  updateMoneyBalance,
  addPoints,
  updateUserVerificationStatus,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectUser = (state: RootState): User | null => state.user.value;

export const selectUserStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' => state.user.status;

export const selectAuthError = (state: RootState): unknown => state.user.error;
