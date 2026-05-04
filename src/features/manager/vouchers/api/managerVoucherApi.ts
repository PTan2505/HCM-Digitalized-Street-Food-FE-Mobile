import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export type VoucherType = 'AMOUNT' | 'PERCENT';
export type VoucherApiType = 'AMOUNT' | 'PERCENTAGE';

export interface ManagerVoucher {
  voucherId: number;
  name: string;
  voucherCode: string;
  description: string | null;
  type: VoucherType;
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number;
  quantity: number;
  usedQuantity: number;
  redeemPoint: number;
  startDate: string;
  endDate: string;
  expiredDate: string | null;
  isActive: boolean;
  campaignId: number | null;
}

export interface VoucherCreateRequest {
  name: string;
  voucherCode: string;
  description: string | null;
  type: VoucherApiType;
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number;
  quantity: number;
  redeemPoint: number;
  startDate: string;
  endDate: string;
  expiredDate: string | null;
  isActive: boolean;
  campaignId: number | null;
}

export type VoucherUpdateRequest = VoucherCreateRequest;

const toApiType = (t: VoucherType): VoucherApiType =>
  t === 'PERCENT' ? 'PERCENTAGE' : 'AMOUNT';

const fromApiType = (t: VoucherApiType | VoucherType): VoucherType =>
  t === 'PERCENTAGE' || t === 'PERCENT' ? 'PERCENT' : 'AMOUNT';

export interface VoucherFormPayload {
  name: string;
  voucherCode: string;
  description: string | null;
  type: VoucherType;
  discountValue: number;
  maxDiscountValue: number | null;
  minAmountRequired: number;
  quantity: number;
  redeemPoint: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  campaignId: number | null;
}

export const buildVoucherCreateRequest = (
  v: VoucherFormPayload
): VoucherCreateRequest => ({
  ...v,
  type: toApiType(v.type),
  maxDiscountValue:
    v.type === 'AMOUNT' ? null : (v.maxDiscountValue ?? null),
  expiredDate: null,
});

const normalizeVoucher = (raw: ManagerVoucher): ManagerVoucher => ({
  ...raw,
  type: fromApiType(raw.type as VoucherApiType | VoucherType),
});

export class ManagerVoucherApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getById(id: number): Promise<ManagerVoucher> {
    const res = await this.apiClient.get<ManagerVoucher>({
      url: apiUrl.voucher.byId(id),
    });
    return normalizeVoucher(res.data);
  }

  async getByCampaign(campaignId: number): Promise<ManagerVoucher[]> {
    const res = await this.apiClient.get<ManagerVoucher[]>({
      url: apiUrl.voucher.byCampaign(campaignId),
    });
    return res.data.map(normalizeVoucher);
  }

  async create(payload: VoucherFormPayload[]): Promise<ManagerVoucher[]> {
    const data = payload.map(buildVoucherCreateRequest);
    const res = await this.apiClient.post<
      ManagerVoucher[],
      VoucherCreateRequest[]
    >({
      url: apiUrl.voucher.base,
      data,
    });
    return res.data.map(normalizeVoucher);
  }

  async update(
    id: number,
    payload: VoucherFormPayload
  ): Promise<ManagerVoucher> {
    const data = buildVoucherCreateRequest(payload);
    const res = await this.apiClient.put<ManagerVoucher, VoucherUpdateRequest>({
      url: apiUrl.voucher.byId(id),
      data,
    });
    return normalizeVoucher(res.data);
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.voucher.byId(id),
    });
  }
}
