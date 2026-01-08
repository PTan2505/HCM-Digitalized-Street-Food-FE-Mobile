import type { RootState } from '@app/store';
import type { LoginRequest, LoginResponse } from '@auth/types/login';
import type {
  RegisterRequest,
  VerifyRegistrationRequest,
  ResendRegistrationOTPRequest,
} from '@auth/types/register';
import type {
  ForgetPasswordRequest,
  ResetPasswordRequest,
  ResendForgetPasswordOTPRequest,
} from '@auth/types/forgetPassword';
import type { User } from '@custom-types/user';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';
import { tokenManagement } from '@utils/tokenManagement';

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

export const authSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: () => {
      void tokenManagement.clearTokens();
      return initialState;
    },
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
      });
  },
});

// Action creators are generated for each case reducer function
export const {
  logout,
  clearError,
  clearRegisterEmail,
  clearForgetPasswordEmail,
} = authSlice.actions;

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
