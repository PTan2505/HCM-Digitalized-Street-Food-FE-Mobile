import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';
import type { ApiResponse } from '@custom-types/apiResponse';
import type { VendorBalanceHistoryItem } from '@manager/payment/types/payment';

export class ManagerPaymentApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVendorBalanceHistory(): Promise<
    ApiResponse<VendorBalanceHistoryItem[]>
  > {
    return this.apiClient.get<VendorBalanceHistoryItem[]>({
      url: apiUrl.payment.vendorHistory,
    });
  }
}
