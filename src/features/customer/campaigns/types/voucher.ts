export type VoucherType = 'PERCENT' | 'AMOUNT';

export interface Voucher {
  userVoucherId: number;
  voucherId: number;
  voucherCode: string;
  voucherName: string;
  description: string | null;
  voucherType: VoucherType;
  discountValue: number;
  minAmountRequired: number | null;
  maxDiscountValue: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  campaignId: number | null;
  quantity: number;
  isAvailable: boolean;
}
