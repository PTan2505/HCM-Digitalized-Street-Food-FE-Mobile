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
} from '@react-native-google-signin/google-signin';
import { createSlice } from '@reduxjs/toolkit';
import { tokenManagement } from '@utils/tokenManagement';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';

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
      return rejectWithValue(error);
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
      console.log('Google ID token:', userInfo.data?.idToken);

      const { token, user } = await axiosApi.loginApi.loginWithGoogle({
        idToken: userInfo.data?.idToken,
      });

      await tokenManagement.setTokens({ newAccessToken: token });

      return { user };
    } catch (error) {
      if (isErrorWithCode(error)) {
        console.log('Google sign-in error code:', error.code);
      }
      return rejectWithValue(error);
    }
  }
);

export const userLoginWithFacebook = createAppAsyncThunk(
  'auth/loginWithFacebook',
  async (_, { rejectWithValue }) => {
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        throw new Error('User cancelled Facebook login');
      }
      console.log(result);

      const data = await AccessToken.getCurrentAccessToken();

      if (!data?.accessToken) {
        throw new Error('No access token received from Facebook');
      }

      console.log('Facebook access token:', data.accessToken);

      // const { token, user } = await axiosApi.loginApi.loginWithFacebook({
      //   accessToken: data.accessToken,
      // });

      // await tokenManagement.setTokens({ newAccessToken: token });

      // return { data };
    } catch (error) {
      console.log('Facebook sign-in error:', error);
      return rejectWithValue(error);
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
        return null;
      }

      const userProfile = await axiosApi.userProfileApi.getUserProfile();
      return userProfile;
    } catch (error) {
      await tokenManagement.clearTokens();
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      return rejectWithValue(error);
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
      } catch (googleError) {
        console.log('Google signOut failed:', googleError);
      }

      // Sign out from Facebook
      try {
        LoginManager.logOut();
      } catch (facebookError) {
        console.log('Facebook logout failed:', facebookError);
      }

      await tokenManagement.clearTokens();

      return null;
    } catch (error) {
      return rejectWithValue(error);
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
        state.value = action.payload.user;
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
        // state.value = action.payload.user;
      })
      .addCase(userLoginWithFacebook.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Facebook login failed' };
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
