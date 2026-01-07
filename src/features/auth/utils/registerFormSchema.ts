import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME),
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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const VerifyRegistrationSchema = z.object({
  username: z.string().nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME),
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
  otp: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_OTP)
    .refine((value) => /^\d{6}$/.test(value), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_OTP,
    }),
});

export const ResendRegistrationOTPSchema = z.object({
  email: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_EMAIL)
    .refine((value) => validator.isEmail(value), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_EMAIL,
    }),
  username: z.string().nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_USERNAME),
});
