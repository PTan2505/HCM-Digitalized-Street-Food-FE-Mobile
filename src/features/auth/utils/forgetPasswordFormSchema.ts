import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import type { TFunction } from 'i18next';
import validator from 'validator';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getForgetPasswordSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .refine((value): boolean => validator.isEmail(value), {
        message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
      }),
  });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getResetPasswordSchema = (t: TFunction) =>
  z
    .object({
      email: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
        .refine((value): boolean => validator.isEmail(value), {
          message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
        }),
      otp: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_OTP))
        .refine((value): boolean => /^\d{6}$/.test(value), {
          message: t(VALIDATE_ERROR_MESSAGES.INVALID_OTP),
        }),
      newPassword: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_NEW_PASSWORD))
        .min(8, t(VALIDATE_ERROR_MESSAGES.NEW_PASSWORD_MIN_LENGTH)),
      confirmPassword: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_CONFIRM_PASSWORD)),
    })
    .refine((data): boolean => data.newPassword === data.confirmPassword, {
      message: t(VALIDATE_ERROR_MESSAGES.PASSWORD_MISMATCH),
      path: ['confirmPassword'],
    });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getResendForgetPasswordOTPSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .refine((value): boolean => validator.isEmail(value), {
        message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
      }),
  });
