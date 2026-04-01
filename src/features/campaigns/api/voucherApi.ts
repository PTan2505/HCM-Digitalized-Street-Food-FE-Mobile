import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface UserVoucherApiDto {
  userVoucherId: number;
  voucherId: number;
  voucherCode: string;
  voucherName: string;
  voucherType: string;
  discountValue: number;
  maxDiscountValue: number | null;
  quantity: number;
}

export class VoucherApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getMyVouchers(): Promise<UserVoucherApiDto[]> {
    const res = await this.apiClient.get<UserVoucherApiDto[]>({
      url: apiUrl.voucher.mine,
    });
    return res.data;
  }

  async claimVoucher(voucherId: number): Promise<UserVoucherApiDto> {
    const res = await this.apiClient.post<UserVoucherApiDto, null>({
      url: apiUrl.voucher.claim(voucherId),
    });
    return res.data;
  }
}
