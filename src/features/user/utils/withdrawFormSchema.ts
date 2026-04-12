import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import type { TFunction } from 'i18next';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getWithdrawSchema = (t: TFunction, balance: number = 0) =>
  z.object({
    toBin: z.string().min(1, t(VALIDATE_ERROR_MESSAGES.WITHDRAW_EMPTY_BANK)),
    toAccountNumber: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.WITHDRAW_EMPTY_ACCOUNT_NUMBER))
      .max(30, t(VALIDATE_ERROR_MESSAGES.WITHDRAW_INVALID_ACCOUNT_NUMBER)),
    amount: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.WITHDRAW_EMPTY_AMOUNT))
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 10000,
        t(VALIDATE_ERROR_MESSAGES.WITHDRAW_MIN_AMOUNT)
      )
      .refine(
        (val) => Number(val) <= balance,
        t(VALIDATE_ERROR_MESSAGES.WITHDRAW_EXCEED_BALANCE)
      ),
    description: z
      .string()
      .min(1, t(VALIDATE_ERROR_MESSAGES.WITHDRAW_EMPTY_DESCRIPTION))
      .max(255, t(VALIDATE_ERROR_MESSAGES.WITHDRAW_MAX_DESCRIPTION)),
  });

export type WithdrawFormValues = z.infer<ReturnType<typeof getWithdrawSchema>>;
