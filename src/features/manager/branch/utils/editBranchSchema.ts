import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import type { TFunction } from 'i18next';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getEditBranchSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t(VALIDATE_ERROR_MESSAGES.REQUIRED)),
    phoneNumber: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER))
      .regex(/^[0-9]{10,11}$/, t(VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER)),
    email: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .email(t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL)),
    addressDetail: z.string().min(1, t(VALIDATE_ERROR_MESSAGES.REQUIRED)),
    ward: z.string().min(1, t(VALIDATE_ERROR_MESSAGES.REQUIRED)),
    city: z.string().min(1, t(VALIDATE_ERROR_MESSAGES.REQUIRED)),
  });

export type EditBranchFormValues = z.infer<
  ReturnType<typeof getEditBranchSchema>
>;
