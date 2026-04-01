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

export interface MarketplaceVoucherDto {
  voucherId: number;
  name: string;
  description: string | null;
  type: string;
  discountValue: number;
  minAmountRequired: number;
  maxDiscountValue: number | null;
  startDate: string;
  endDate: string;
  expiredDate: string | null;
  isActive: boolean;
  voucherCode: string;
  redeemPoint: number;
  quantity: number;
  usedQuantity: number;
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

  async getMarketplaceVouchers(): Promise<MarketplaceVoucherDto[]> {
    const res = await this.apiClient.get<MarketplaceVoucherDto[]>({
      url: apiUrl.voucher.marketplace,
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
