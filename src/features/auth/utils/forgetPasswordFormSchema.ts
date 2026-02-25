import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

export const ForgetPasswordSchema = z.object({
  email: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL)
    .refine((value) => validator.isEmail(value), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_EMAIL,
    }),
});

export const ResetPasswordSchema = z
  .object({
    email: z
      .string()
      .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL)
      .refine((value) => validator.isEmail(value), {
        message: VALIDATE_ERROR_MESSAGES.INVALID_EMAIL,
      }),
    otp: z
      .string()
      .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_OTP)
      .refine((value) => /^\d{6}$/.test(value), {
        message: VALIDATE_ERROR_MESSAGES.INVALID_OTP,
      }),
    newPassword: z
      .string()
      .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_NEW_PASSWORD)
      .min(8, VALIDATE_ERROR_MESSAGES.NEW_PASSWORD_MIN_LENGTH),
    confirmPassword: z
      .string()
      .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_CONFIRM_PASSWORD),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: VALIDATE_ERROR_MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  });

export const ResendForgetPasswordOTPSchema = z.object({
  email: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL)
    .refine((value) => validator.isEmail(value), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_EMAIL,
    }),
});
