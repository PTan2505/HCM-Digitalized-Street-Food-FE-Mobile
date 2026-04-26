import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type {
  PaymentTransaction,
  WithdrawRequest,
  WithdrawResponse,
} from '@user/types/payment';
import type { ApiResponse } from '@custom-types/apiResponse';

export class UserPaymentApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async requestWithdraw(
    data: WithdrawRequest
  ): Promise<ApiResponse<WithdrawResponse>> {
    return this.apiClient.post<WithdrawResponse, WithdrawRequest>({
      url: apiUrl.payment.userTransfer,
      data,
    });
  }

  async getPaymentHistory(): Promise<ApiResponse<PaymentTransaction[]>> {
    return this.apiClient.get<PaymentTransaction[]>({
      url: apiUrl.payment.history,
    });
  }
}
