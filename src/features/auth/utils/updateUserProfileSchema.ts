import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import type { TFunction } from 'i18next';
import validator from 'validator';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getUpdateProfileSchema = (t: TFunction) =>
  z.object({
    firstName: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_FIRST_NAME))
      .optional()
      .nullable(),
    lastName: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_LAST_NAME))
      .optional()
      .nullable(),
    phoneNumber: z
      .string()
      .optional()
      .nullable()
      .refine(
        (value): boolean => {
          if (!value) return true;
          return validator.isMobilePhone(value, 'vi-VN');
        },
        {
          message: t(VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER),
        }
      ),
    username: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME))
      .min(3, t(VALIDATE_ERROR_MESSAGES.USERNAME_MIN_LENGTH))
      .optional()
      .nullable(),
    email: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .optional()
      .nullable()
      .refine(
        (value): boolean => {
          if (!value) return true;
          return validator.isEmail(value);
        },
        {
          message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
        }
      ),
  });
