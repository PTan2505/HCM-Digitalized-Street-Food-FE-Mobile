import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '@components/CustomInput';
import { NumericInput } from '@components/NumericInput';
import type { CampaignFormValues } from '@manager/campaigns/utils/campaignSchema';
import { type JSX } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  index: number;
  onRemove: () => void;
}

export const VoucherDraftCard = ({ index, onRemove }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<CampaignFormValues>();
  const type = watch(`vouchers.${index}.type`);

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-3">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-gray-800">
          {t('manager_campaigns.voucher_draft_index', { index: index + 1 })}
        </Text>
        <TouchableOpacity
          onPress={onRemove}
          className="flex-row items-center gap-1 rounded-full bg-red-50 px-3 py-1"
          accessibilityLabel={t('manager_campaigns.remove_voucher_draft')}
        >
          <Ionicons name="trash-outline" size={14} color="#EF4444" />
          <Text className="text-xs font-semibold text-red-500">
            {t('manager_campaigns.remove_voucher_draft')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        <CustomInput<CampaignFormValues>
          name={`vouchers.${index}.name`}
          label={t('manager_vouchers.field_name')}
          required
        />
        <CustomInput<CampaignFormValues>
          name={`vouchers.${index}.voucherCode`}
          label={t('manager_vouchers.field_code')}
          required
        />
        <CustomInput<CampaignFormValues>
          name={`vouchers.${index}.description`}
          label={t('manager_vouchers.field_description')}
        />

        <Controller
          control={control}
          name={`vouchers.${index}.type`}
          render={({ field, fieldState }) => (
            <View className="gap-1">
              <Text className="text-lg font-semibold text-[#616161]">
                {t('manager_vouchers.field_type')}
                <Text className="text-[#FE4763]"> *</Text>
              </Text>
              <View className="mt-1 flex-row rounded-full bg-gray-100 p-1">
                {(['AMOUNT', 'PERCENT'] as const).map((opt) => {
                  const selected = field.value === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => field.onChange(opt)}
                      className={`flex-1 items-center rounded-full py-2 ${
                        selected ? 'bg-primary' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          selected ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {t(`manager_vouchers.type_${opt.toLowerCase()}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {fieldState.error?.message ? (
                <Text className="mt-1 text-base text-[#FE4763]">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <NumericInput<CampaignFormValues>
          name={`vouchers.${index}.discountValue`}
          label={t('manager_vouchers.field_discount_value')}
          required
          suffix={type === 'PERCENT' ? '%' : 'đ'}
        />

        {type === 'PERCENT' ? (
          <NumericInput<CampaignFormValues>
            name={`vouchers.${index}.maxDiscountValue`}
            label={t('manager_vouchers.field_max_discount_value')}
            suffix="đ"
          />
        ) : null}

        <NumericInput<CampaignFormValues>
          name={`vouchers.${index}.minAmountRequired`}
          label={t('manager_vouchers.field_min_amount_required')}
          suffix="đ"
        />

        <NumericInput<CampaignFormValues>
          name={`vouchers.${index}.quantity`}
          label={t('manager_vouchers.field_quantity')}
          required
        />
      </View>
    </View>
  );
};
