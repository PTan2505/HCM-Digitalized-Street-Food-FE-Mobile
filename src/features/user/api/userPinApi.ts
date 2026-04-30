import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface PinStatus {
  hasPin: boolean;
}

export interface VerifyPinResponse {
  success: boolean;
  attemptsRemaining?: number;
}

export class UserPinApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getStatus(): Promise<PinStatus> {
    const res = await this.apiClient.get<PinStatus>({
      url: apiUrl.user.pin.status,
    });
    return res.data;
  }

  async setPin(pin: string): Promise<void> {
    await this.apiClient.post<void, { pin: string }>({
      url: apiUrl.user.pin.set,
      data: { pin },
    });
  }

  async verifyPin(pin: string): Promise<VerifyPinResponse> {
    const res = await this.apiClient.post<VerifyPinResponse, { pin: string }>({
      url: apiUrl.user.pin.verify,
      data: { pin },
    });
    return res.data;
  }

  async changePin(currentPin: string, newPin: string): Promise<void> {
    await this.apiClient.post<void, { currentPin: string; newPin: string }>({
      url: apiUrl.user.pin.change,
      data: { currentPin, newPin },
    });
  }

  async removePin(pin: string): Promise<void> {
    await this.apiClient.deleteWithBody<void, { pin: string }>({
      url: apiUrl.user.pin.remove,
      data: { pin },
    });
  }
}
