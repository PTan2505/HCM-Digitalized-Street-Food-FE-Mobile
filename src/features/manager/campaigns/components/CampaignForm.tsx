import { CustomInput } from '@components/CustomInput';
import { DateTimeField } from '@components/DateTimeField';
import { BranchSelector } from '@manager/campaigns/components/BranchSelector';
import {
  CampaignImageUpload,
  type CampaignImageValue,
} from '@manager/campaigns/components/CampaignImageUpload';
import type { CampaignFormValues } from '@manager/campaigns/utils/campaignSchema';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { type JSX, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  image: CampaignImageValue | null;
  onImageChange: (next: CampaignImageValue | null) => void;
  initialImageUrl?: string | null;
  showBranchSelector?: boolean;
}

export const CampaignForm = ({
  image,
  onImageChange,
  initialImageUrl,
  showBranchSelector = true,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { control } = useFormContext<CampaignFormValues>();
  const { data: vendorInfo } = useVendorInfo();

  const branches = useMemo(
    () => vendorInfo?.branches ?? [],
    [vendorInfo?.branches]
  );

  return (
    <View className="gap-4">
      <CustomInput<CampaignFormValues>
        name="name"
        label={t('manager_campaigns.field_name')}
        required
      />
      <CustomInput<CampaignFormValues>
        name="description"
        label={t('manager_campaigns.field_description')}
        required
      />
      <CustomInput<CampaignFormValues>
        name="targetSegment"
        label={t('manager_campaigns.target_segment')}
      />
      <DateTimeField<CampaignFormValues>
        name="startDate"
        label={t('manager_campaigns.field_start_date')}
        required
        mode="datetime"
      />
      <DateTimeField<CampaignFormValues>
        name="endDate"
        label={t('manager_campaigns.field_end_date')}
        required
        mode="datetime"
      />

      <CampaignImageUpload
        value={image}
        onChange={onImageChange}
        initialUrl={initialImageUrl ?? null}
      />

      {showBranchSelector ? (
        <Controller
          control={control}
          name="branchIds"
          render={({ field }) => (
            <View>
              <BranchSelector
                branches={branches}
                selectedIds={field.value ?? []}
                onChange={field.onChange}
                emptyText={t('manager_campaigns.no_branches_available')}
              />
              {branches.length === 0 ? null : (
                <Text className="mt-1 text-xs text-gray-400">
                  {t('manager_campaigns.branches_optional_hint')}
                </Text>
              )}
            </View>
          )}
        />
      ) : null}
    </View>
  );
};
