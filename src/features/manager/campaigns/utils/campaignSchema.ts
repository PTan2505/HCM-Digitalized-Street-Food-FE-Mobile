import type { TFunction } from 'i18next';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getVoucherDraftSchema = (t: TFunction) =>
  z
    .object({
      name: z
        .string()
        .min(1, t('validation.required'))
        .max(255, t('manager_vouchers.name_too_long')),
      voucherCode: z
        .string()
        .min(1, t('validation.required'))
        .max(100, t('manager_vouchers.code_too_long')),
      description: z
        .string()
        .max(1000, t('manager_vouchers.description_too_long'))
        .nullable()
        .optional(),
      type: z.enum(['AMOUNT', 'PERCENT'], {
        message: t('validation.required'),
      }),
      discountValue: z
        .number({ message: t('manager_vouchers.invalid_number') })
        .min(0, t('manager_vouchers.must_be_non_negative')),
      maxDiscountValue: z
        .number()
        .min(0, t('manager_vouchers.must_be_non_negative'))
        .nullable(),
      minAmountRequired: z
        .number({ message: t('manager_vouchers.invalid_number') })
        .min(0, t('manager_vouchers.must_be_non_negative')),
      quantity: z
        .number({ message: t('manager_vouchers.invalid_number') })
        .int(t('manager_vouchers.must_be_integer'))
        .min(0, t('manager_vouchers.must_be_non_negative')),
      redeemPoint: z
        .number({ message: t('manager_vouchers.invalid_number') })
        .int(t('manager_vouchers.must_be_integer'))
        .min(0, t('manager_vouchers.must_be_non_negative')),
    })
    .refine((data) => data.type !== 'PERCENT' || data.discountValue <= 100, {
      message: t('manager_vouchers.percent_max_100'),
      path: ['discountValue'],
    });

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const getCampaignSchema = (
  t: TFunction,
  options: { requireVouchers?: boolean } = {}
) => {
  const voucherDraft = getVoucherDraftSchema(t);
  const vouchersField = options.requireVouchers
    ? z
        .array(voucherDraft)
        .min(1, t('manager_campaigns.requires_voucher_create'))
    : z.array(voucherDraft).optional();

  return z
    .object({
      name: z.string().trim().min(1, t('validation.required')),
      description: z.string().trim().min(1, t('validation.required')),
      targetSegment: z.string().optional(),
      startDate: z.string().min(1, t('validation.required')),
      endDate: z.string().min(1, t('validation.required')),
      branchIds: z.array(z.number()).optional(),
      vouchers: vouchersField,
    })
    .refine((data) => data.endDate > data.startDate, {
      message: t('manager_campaigns.end_before_start'),
      path: ['endDate'],
    });
};
/* eslint-enable @typescript-eslint/explicit-function-return-type */

export type VoucherDraftValues = z.infer<
  ReturnType<typeof getVoucherDraftSchema>
>;
export type CampaignFormValues = z.infer<ReturnType<typeof getCampaignSchema>>;
