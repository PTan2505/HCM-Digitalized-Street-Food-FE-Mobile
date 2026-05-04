import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import { VN_PHONE_REGEX } from '@manager/branch/utils/branchAddress';
import type { TFunction } from 'i18next';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getCreateVendorSchema = (t: TFunction) =>
  z.object({
    ownerName: z
      .string()
      .min(3, t('manager_branch.error_owner_name_min'))
      .max(100, t('manager_branch.error_owner_name_max')),
    phoneNumber: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER))
      .regex(VN_PHONE_REGEX, t(VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER)),
    email: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .email(t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL)),
    branchName: z
      .string()
      .min(3, t('manager_branch.error_branch_name_min'))
      .max(100, t('manager_branch.error_branch_name_max')),
    addressDetail: z.string().min(10, t('manager_branch.error_address_min')),
    ward: z.string(),
    city: z.string(),
    lat: z
      .number({ error: t('manager_branch.location_required') })
      .refine((v) => v !== 0, {
        message: t('manager_branch.location_required'),
      }),
    long: z
      .number({ error: t('manager_branch.location_required') })
      .refine((v) => v !== 0, {
        message: t('manager_branch.location_required'),
      }),
    dietaryPreferenceIds: z
      .array(z.number())
      .min(1, t('manager_branch.error_dietary_required')),
  });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getAddBranchSchema = (t: TFunction) =>
  z.object({
    phoneNumber: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER))
      .regex(VN_PHONE_REGEX, t(VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER)),
    email: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .email(t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL)),
    branchName: z
      .string()
      .min(3, t('manager_branch.error_branch_name_min'))
      .max(100, t('manager_branch.error_branch_name_max')),
    addressDetail: z.string().min(10, t('manager_branch.error_address_min')),
    ward: z.string(),
    city: z.string(),
    lat: z
      .number({ error: t('manager_branch.location_required') })
      .refine((v) => v !== 0, {
        message: t('manager_branch.location_required'),
      }),
    long: z
      .number({ error: t('manager_branch.location_required') })
      .refine((v) => v !== 0, {
        message: t('manager_branch.location_required'),
      }),
  });

export type CreateVendorFormValues = z.infer<
  ReturnType<typeof getCreateVendorSchema>
>;
export type AddBranchFormValues = z.infer<
  ReturnType<typeof getAddBranchSchema>
>;
