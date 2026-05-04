import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '@components/CustomInput';
import { DateTimeField } from '@components/DateTimeField';
import { BranchSelector } from '@manager/campaigns/components/BranchSelector';
import {
  CampaignImageUpload,
  type CampaignImageValue,
} from '@manager/campaigns/components/CampaignImageUpload';
import { VoucherDraftCard } from '@manager/campaigns/components/VoucherDraftCard';
import type {
  CampaignFormValues,
  VoucherDraftValues,
} from '@manager/campaigns/utils/campaignSchema';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { type JSX, useMemo } from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  image: CampaignImageValue | null;
  onImageChange: (next: CampaignImageValue | null) => void;
  initialImageUrl?: string | null;
  showBranchSelector?: boolean;
  /** Show the inline vouchers section (used in create mode). */
  showVoucherSection?: boolean;
}

const buildVoucherDraft = (): VoucherDraftValues => ({
  name: '',
  voucherCode: '',
  description: '',
  type: 'AMOUNT',
  discountValue: 0,
  maxDiscountValue: null,
  minAmountRequired: 0,
  quantity: 0,
  redeemPoint: 0,
});

export const CampaignForm = ({
  image,
  onImageChange,
  initialImageUrl,
  showBranchSelector = true,
  showVoucherSection = false,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { control, formState } = useFormContext<CampaignFormValues>();
  const { data: vendorInfo } = useVendorInfo();

  const branches = useMemo(
    () => (vendorInfo?.branches ?? []).filter((branch) => branch.isSubscribed),
    [vendorInfo?.branches]
  );

  const { fields, append, remove } = useFieldArray<
    CampaignFormValues,
    'vouchers'
  >({
    control,
    name: 'vouchers',
  });

  const vouchersError = formState.errors.vouchers;
  const vouchersErrorMessage =
    vouchersError && 'message' in vouchersError && vouchersError.message
      ? String(vouchersError.message)
      : null;

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

      {showVoucherSection ? (
        <View className="gap-3 rounded-2xl bg-gray-50 p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-800">
              {t('manager_campaigns.vouchers_section_title')}
              <Text className="text-[#FE4763]"> *</Text>
            </Text>
            <TouchableOpacity
              onPress={() => append(buildVoucherDraft())}
              className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-1.5"
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text className="text-xs font-bold text-white">
                {t('manager_campaigns.add_voucher_draft')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-gray-500">
            {t('manager_campaigns.vouchers_required_hint')}
          </Text>
          <Text className="text-xs text-gray-500">
            {t('manager_campaigns.voucher_window_locked_hint')}
          </Text>

          {fields.length === 0 ? (
            <View className="items-center rounded-xl border border-dashed border-gray-300 bg-white py-6">
              <Text className="text-sm text-gray-400">
                {t('manager_campaigns.no_voucher_drafts')}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {fields.map((field, index) => (
                <VoucherDraftCard
                  key={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                />
              ))}
            </View>
          )}

          {vouchersErrorMessage ? (
            <Text className="text-sm text-[#FE4763]">
              {vouchersErrorMessage}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
