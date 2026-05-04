import type { TFunction } from 'i18next';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getVoucherSchema = (t: TFunction) =>
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
      startDate: z.string().min(1, t('validation.required')),
      endDate: z.string().min(1, t('validation.required')),
      isActive: z.boolean(),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: t('manager_vouchers.end_before_start'),
      path: ['endDate'],
    })
    .refine((data) => data.type !== 'PERCENT' || data.discountValue <= 100, {
      message: t('manager_vouchers.percent_max_100'),
      path: ['discountValue'],
    });

export type VoucherFormValues = z.infer<ReturnType<typeof getVoucherSchema>>;
