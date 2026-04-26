export interface Voucher {
  userVoucherId: number;
  voucherId: number;
  voucherCode: string;
  voucherName: string;
  description: string | null;
  voucherType: string;
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
