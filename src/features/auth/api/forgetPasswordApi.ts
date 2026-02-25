import type {
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResendForgetPasswordOTPRequest,
  ResendForgetPasswordOTPResponse,
} from '@auth/types/forgetPassword';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class ForgetPasswordApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async forgetPassword(
    data: ForgetPasswordRequest
  ): Promise<ForgetPasswordResponse> {
    let res = null;
    res = await this.apiClient.post<
      ForgetPasswordResponse,
      ForgetPasswordRequest
    >({
      url: apiUrl.auth.forgetPassword,
      data,
    });
    return res.data;
  }

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    let res = null;
    res = await this.apiClient.post<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      url: apiUrl.auth.resetPassword,
      data,
    });
    return res.data;
  }

  async resendForgetPasswordOTP(
    data: ResendForgetPasswordOTPRequest
  ): Promise<ResendForgetPasswordOTPResponse> {
    let res = null;
    res = await this.apiClient.post<
      ResendForgetPasswordOTPResponse,
      ResendForgetPasswordOTPRequest
    >({
      url: apiUrl.auth.resendForgetPasswordOTP,
      data,
    });
    return res.data;
  }
}
