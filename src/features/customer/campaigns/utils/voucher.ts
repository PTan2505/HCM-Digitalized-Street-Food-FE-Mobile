import type { Voucher } from '@features/customer/campaigns/types/voucher';

export const getExpiresAt = (voucher: { endDate: string | null }): Date | null =>
  voucher.endDate ? new Date(voucher.endDate) : null;

export const isExpired = (voucher: Voucher): boolean =>
  getExpiresAt(voucher) !== null && getExpiresAt(voucher)! <= new Date();

export const isUsed = (voucher: Voucher): boolean => !voucher.isAvailable;

export const isNotYetActive = (voucher: Voucher): boolean =>
  voucher.startDate != null && new Date(voucher.startDate) > new Date();

export const isExpiringSoon = (voucher: Voucher): boolean => {
  const expiresAt = getExpiresAt(voucher);
  const now = new Date();
  const hoursLeft =
    expiresAt !== null
      ? (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      : Infinity;
  return hoursLeft > 0 && hoursLeft <= 24;
};
