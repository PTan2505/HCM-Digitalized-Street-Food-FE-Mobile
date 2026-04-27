import type { User } from '@custom-types/user';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface ContactVerificationResponse {
  message: string;
  channels: string[];
}

export interface VerifyOtpResponse {
  message: string;
  channel: string;
}

export class UserProfileApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserProfile(): Promise<User> {
    const res = await this.apiClient.get<User>({
      url: apiUrl.user.profile,
    });
    return res.data;
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const res = await this.apiClient.put<User, Partial<User>>({
      url: apiUrl.user.profile,
      data,
    });
    return res.data;
  }

  async startContactVerification(): Promise<ContactVerificationResponse> {
    const res = await this.apiClient.post<ContactVerificationResponse, null>({
      url: apiUrl.auth.contactVerification,
    });
    return res.data;
  }

  async verifyContactOtp(otp: string): Promise<VerifyOtpResponse> {
    const res = await this.apiClient.post<VerifyOtpResponse, { otp: string }>({
      url: apiUrl.user.verifyOtp,
      data: { otp },
    });
    return res.data;
  }

  async markUserInfoSetup(): Promise<void> {
    await this.apiClient.put<void, null>({
      url: apiUrl.user.userSetup.userinfo,
    });
  }

  async getUserById(id: number): Promise<User> {
    const res = await this.apiClient.get<User>({
      url: apiUrl.user.byId(id),
    });
    return res.data;
  }

  async uploadAvatar(formData: FormData): Promise<User> {
    const res = await this.apiClient.post<User, FormData>({
      url: apiUrl.user.avatar,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async markDietarySetup(): Promise<void> {
    await this.apiClient.put<void, null>({
      url: apiUrl.user.userSetup.dietary,
    });
  }
}
