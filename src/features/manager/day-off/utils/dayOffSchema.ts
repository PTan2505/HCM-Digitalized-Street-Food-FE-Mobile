import type { TFunction } from 'i18next';
import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getDayOffSchema = (t: TFunction) =>
  z
    .object({
      startDate: z
        .string()
        .regex(DATE_REGEX, t('manager_day_off.error_date_format')),
      endDate: z
        .string()
        .regex(DATE_REGEX, t('manager_day_off.error_date_format')),
      isFullDay: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: t('manager_day_off.error_end_before_start'),
      path: ['endDate'],
    })
    .refine(
      (data) => {
        if (!data.isFullDay) {
          return TIME_REGEX.test(data.startTime ?? '');
        }
        return true;
      },
      {
        message: t('manager_day_off.error_time_format'),
        path: ['startTime'],
      }
    )
    .refine(
      (data) => {
        if (!data.isFullDay) {
          return TIME_REGEX.test(data.endTime ?? '');
        }
        return true;
      },
      {
        message: t('manager_day_off.error_time_format'),
        path: ['endTime'],
      }
    )
    .refine(
      (data) => {
        if (!data.isFullDay && data.startTime && data.endTime) {
          return data.endTime > data.startTime;
        }
        return true;
      },
      {
        message: t('manager_day_off.error_end_time_before_start'),
        path: ['endTime'],
      }
    );

export type DayOffFormValues = z.infer<ReturnType<typeof getDayOffSchema>>;
