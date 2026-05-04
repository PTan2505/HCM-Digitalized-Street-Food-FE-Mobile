import { CustomInput } from '@components/CustomInput';
import { DateTimeField } from '@components/DateTimeField';
import { NumericInput } from '@components/NumericInput';
import type { VoucherFormValues } from '@manager/vouchers/utils/voucherSchema';
import { type JSX } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  showActiveToggle?: boolean;
  /** Lock the voucher's start/end date pickers to the campaign's window. */
  campaignWindow?: { startDate: string; endDate: string } | null;
}

export const VoucherForm = ({
  showActiveToggle = true,
  campaignWindow,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<VoucherFormValues>();
  const type = watch('type');

  const minDate = campaignWindow
    ? new Date(campaignWindow.startDate)
    : undefined;
  const maxDate = campaignWindow
    ? new Date(campaignWindow.endDate)
    : undefined;

  return (
    <View className="gap-4">
      <CustomInput<VoucherFormValues>
        name="name"
        label={t('manager_vouchers.field_name')}
        required
      />
      <CustomInput<VoucherFormValues>
        name="voucherCode"
        label={t('manager_vouchers.field_code')}
        required
      />
      <CustomInput<VoucherFormValues>
        name="description"
        label={t('manager_vouchers.field_description')}
      />

      {/* Type segmented control */}
      <Controller
        control={control}
        name="type"
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

      <NumericInput<VoucherFormValues>
        name="discountValue"
        label={t('manager_vouchers.field_discount_value')}
        required
        suffix={type === 'PERCENT' ? '%' : 'đ'}
      />

      {type === 'PERCENT' ? (
        <NumericInput<VoucherFormValues>
          name="maxDiscountValue"
          label={t('manager_vouchers.field_max_discount_value')}
          suffix="đ"
        />
      ) : null}

      <NumericInput<VoucherFormValues>
        name="minAmountRequired"
        label={t('manager_vouchers.field_min_amount_required')}
        suffix="đ"
      />

      <NumericInput<VoucherFormValues>
        name="quantity"
        label={t('manager_vouchers.field_quantity')}
        required
      />

      <NumericInput<VoucherFormValues>
        name="redeemPoint"
        label={t('manager_vouchers.field_redeem_point')}
      />

      <DateTimeField<VoucherFormValues>
        name="startDate"
        label={t('manager_vouchers.field_start_date')}
        required
        mode="datetime"
        minimumDate={minDate}
        maximumDate={maxDate}
      />
      <DateTimeField<VoucherFormValues>
        name="endDate"
        label={t('manager_vouchers.field_end_date')}
        required
        mode="datetime"
        minimumDate={minDate}
        maximumDate={maxDate}
      />
      {campaignWindow ? (
        <Text className="-mt-2 text-xs text-gray-500">
          {t('manager_vouchers.window_locked_hint')}
        </Text>
      ) : null}

      {showActiveToggle ? (
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <View className="flex-row items-center justify-between rounded-xl bg-gray-50 p-3">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-semibold text-gray-800">
                  {t('manager_vouchers.field_is_active')}
                </Text>
                <Text className="text-xs text-gray-500">
                  {t('manager_vouchers.field_is_active_hint')}
                </Text>
              </View>
              <Switch
                value={field.value === true}
                onValueChange={(next) => field.onChange(next)}
              />
            </View>
          )}
        />
      ) : null}
    </View>
  );
};
