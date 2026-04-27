import type { TFunction } from 'i18next';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getScheduleSchema = (t: TFunction) =>
  z
    .object({
      openTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, t('manager_schedule.open_time')),
      closeTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, t('manager_schedule.close_time')),
    })
    .refine((data) => data.closeTime > data.openTime, {
      message: t('manager_schedule.error_close_before_open'),
      path: ['closeTime'],
    });
