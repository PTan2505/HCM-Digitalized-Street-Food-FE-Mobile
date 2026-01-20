import type {
  LoginRequest,
  LoginResponse,
  LoginWithGoogleRequest,
} from '@auth/types/login';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export class LoginApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    let res = null;
    res = await this.apiClient.post<LoginResponse, LoginRequest>({
      url: apiUrl.auth.login,
      data,
    });
    return res.data;
  }

  async loginWithGoogle(data: LoginWithGoogleRequest): Promise<LoginResponse> {
    let res = null;
    res = await this.apiClient.post<LoginResponse, LoginWithGoogleRequest>({
      url: apiUrl.auth.googleLogin,
      data,
    });
    return res.data;
  }
}
