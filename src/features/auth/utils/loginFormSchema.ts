import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL)
    .refine((value) => validator.isEmail(value), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_EMAIL,
    }),
  password: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_PASSWORD)
    .min(6, VALIDATE_ERROR_MESSAGES.PASSWORD_MIN_LENGTH),
});

export const LoginWithPhoneNumberSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER)
    .refine((value) => validator.isMobilePhone(value, 'vi-VN'), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER,
    }),
  otp: z.string().optional(),
});
