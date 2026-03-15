import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import type { TFunction } from 'i18next';
import validator from 'validator';
import { z } from 'zod';

export const getLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL))
      .refine((value) => validator.isEmail(value), {
        message: t(VALIDATE_ERROR_MESSAGES.INVALID_EMAIL),
      }),
    password: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_PASSWORD))
      .min(6, t(VALIDATE_ERROR_MESSAGES.PASSWORD_MIN_LENGTH)),
  });

export const getLoginWithPhoneNumberSchema = (t: TFunction) =>
  z.object({
    phoneNumber: z
      .string()
      .nonempty(t(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER))
      .refine((value) => validator.isMobilePhone(value, 'vi-VN'), {
        message: t(VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER),
      }),
    otp: z.string().optional(),
  });
