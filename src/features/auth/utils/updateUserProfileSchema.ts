import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  firstName: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_FIRST_NAME)
    .optional()
    .nullable(),
  lastName: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_LAST_NAME)
    .optional()
    .nullable(),
  phoneNumber: z
    .string()
    .optional()
    .nullable()
    .refine(
      (value) => {
        if (!value) return true;
        return validator.isMobilePhone(value, 'vi-VN');
      },
      {
        message: VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER,
      }
    ),
  username: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME)
    .min(3, VALIDATE_ERROR_MESSAGES.USERNAME_MIN_LENGTH)
    .optional()
    .nullable(),
  email: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL)
    .optional()
    .nullable()
    .refine(
      (value) => {
        if (!value) return true;
        return validator.isEmail(value);
      },
      {
        message: VALIDATE_ERROR_MESSAGES.INVALID_EMAIL,
      }
    ),
});
