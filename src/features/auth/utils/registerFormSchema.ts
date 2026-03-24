import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import type { TFunction } from 'i18next';
import validator from 'validator';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getRegisterSchema = (t: TFunction) =>
  z
    .object({
      username: z
        .string()
        .min(5, t(VALIDATE_ERROR_MESSAGES.MIN_USERNAME_LENGTH))
        .max(100, t(VALIDATE_ERROR_MESSAGES.MAX_USERNAME_LENGTH))
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME)),
      email: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
        .refine((value): boolean => validator.isEmail(value), {
          message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
        }),
      password: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_PASSWORD))
        .min(8, t(VALIDATE_ERROR_MESSAGES.PASSWORD_MIN_LENGTH)),
      firstName: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_NAME))
        .regex(
          /^[a-zA-Z\u00C0-\u1EF9\s]+$/,
          t(VALIDATE_ERROR_MESSAGES.INVALID_NAME)
        ),
      lastName: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_LAST_NAME))
        .regex(
          /^[a-zA-Z\u00C0-\u1EF9\s]+$/,
          t(VALIDATE_ERROR_MESSAGES.INVALID_LAST_NAME)
        ),
      phoneNumber: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER))
        .refine((value): boolean => validator.isMobilePhone(value, 'vi-VN'), {
          message: t(VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER),
        }),
      confirmPassword: z
        .string()
        .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_CONFIRM_PASSWORD)),
    })
    .refine((data): boolean => data.password === data.confirmPassword, {
      message: t(VALIDATE_ERROR_MESSAGES.PASSWORD_MISMATCH),
      path: ['confirmPassword'],
    });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getVerifyRegistrationSchema = (t: TFunction) =>
  z.object({
    // username: z.string().nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME)),
    email: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .refine((value): boolean => validator.isEmail(value), {
        message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
      }),
    // password: z
    //   .string()
    //   .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_PASSWORD))
    //   .min(6, t(VALIDATE_ERROR_MESSAGES.PASSWORD_MIN_LENGTH)),
    otp: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_OTP))
      .refine((value): boolean => /^\d{6}$/.test(value), {
        message: t(VALIDATE_ERROR_MESSAGES.INVALID_OTP),
      }),
  });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getResendRegistrationOTPSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .refine((value): boolean => validator.isEmail(value), {
        message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
      }),
    username: z.string().nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME)),
  });
