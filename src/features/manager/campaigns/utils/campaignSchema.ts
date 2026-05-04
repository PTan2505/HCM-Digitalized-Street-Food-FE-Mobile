import type { TFunction } from 'i18next';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getCampaignSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().trim().min(1, t('validation.required')),
      description: z.string().trim().min(1, t('validation.required')),
      targetSegment: z.string().optional(),
      startDate: z.string().min(1, t('validation.required')),
      endDate: z.string().min(1, t('validation.required')),
      branchIds: z.array(z.number()).optional(),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: t('manager_campaigns.end_before_start'),
      path: ['endDate'],
    });

export type CampaignFormValues = z.infer<ReturnType<typeof getCampaignSchema>>;
