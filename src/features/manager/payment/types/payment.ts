export type VendorPaymentMethod = 'Vendor Wallet' | 'PAYOS_PAYOUT';

export type VendorPaymentStatus = 'PAID' | 'PENDING' | 'CANCELLED' | 'FAILED';

export interface VendorBalanceHistoryItem {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  amount: number;
  description: string;
  status: VendorPaymentStatus | null;
  createdAt: string;
  paidAt: string | null;
  transactionCode: string | null;
  orderId: number | null;
  branchId: number | null;
  branchCampaignId: number | null;
  paymentMethod: VendorPaymentMethod | null;
  checkoutUrl: string | null;
}
