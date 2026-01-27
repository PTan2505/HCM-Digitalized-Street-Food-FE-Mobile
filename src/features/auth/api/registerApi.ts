import type {
  RegisterRequest,
  RegisterResponse,
  VerifyRegistrationRequest,
  VerifyRegistrationResponse,
  ResendRegistrationOTPRequest,
  ResendRegistrationOTPResponse,
} from '@auth/types/register';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class RegisterApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    let res = null;
    res = await this.apiClient.post<RegisterResponse, RegisterRequest>({
      url: apiUrl.auth.register,
      data,
    });
    return res.data;
  }

  async verifyRegistration(
    data: VerifyRegistrationRequest
  ): Promise<VerifyRegistrationResponse> {
    let res = null;
    res = await this.apiClient.post<
      VerifyRegistrationResponse,
      VerifyRegistrationRequest
    >({
      url: apiUrl.auth.verifyRegistration,
      data,
    });
    return res.data;
  }

  async resendRegistrationOTP(
    data: ResendRegistrationOTPRequest
  ): Promise<ResendRegistrationOTPResponse> {
    let res = null;
    res = await this.apiClient.post<
      ResendRegistrationOTPResponse,
      ResendRegistrationOTPRequest
    >({
      url: apiUrl.auth.resendRegistrationOTP,
      data,
    });
    return res.data;
  }
}
