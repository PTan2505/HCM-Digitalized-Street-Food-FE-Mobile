import type {
  Voucher,
  VoucherType,
} from '@features/customer/campaigns/types/voucher';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface UserVoucherApiDto extends Voucher {
  expiredDate: string | null;
}

interface CampaignVoucherBase {
  voucherId: number;
  name: string;
  description: string | null;
  type: VoucherType;
  discountValue: number;
  minAmountRequired: number;
  maxDiscountValue: number | null;
  startDate: string;
  endDate: string;
  voucherCode: string;
  quantity: number;
  usedQuantity: number;
}

export interface VoucherDto extends CampaignVoucherBase {
  expiredDate: string | null;
  isActive: boolean;
  redeemPoint: number;
}

export interface CampaignVoucherDto extends CampaignVoucherBase {
  isActive: boolean;
  redeemPoint: number;
  campaignId: number;
  remain: number;
  isIndependentQuest: boolean;
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

  async getMarketplaceVouchers(): Promise<VoucherDto[]> {
    const res = await this.apiClient.get<VoucherDto[]>({
      url: apiUrl.voucher.marketplace,
    });
    return res.data;
  }

  async getApplicableVouchers(branchId: number): Promise<UserVoucherApiDto[]> {
    const res = await this.apiClient.get<UserVoucherApiDto[]>({
      url: apiUrl.voucher.applicableByBranch(branchId),
    });
    return res.data;
  }

  async claimVoucher(voucherId: number): Promise<UserVoucherApiDto> {
    const res = await this.apiClient.post<UserVoucherApiDto, null>({
      url: apiUrl.voucher.claim(voucherId),
    });
    return res.data;
  }

  async getCampaignVouchers(campaignId: number): Promise<CampaignVoucherDto[]> {
    const res = await this.apiClient.get<CampaignVoucherDto[]>({
      url: apiUrl.voucher.byCampaign(campaignId),
    });
    return res.data;
  }
}
