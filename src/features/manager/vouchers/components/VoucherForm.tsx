import { CustomInput } from '@components/CustomInput';
import { DateTimeField } from '@components/DateTimeField';
import { NumericInput } from '@components/NumericInput';
import type { VoucherFormValues } from '@manager/vouchers/utils/voucherSchema';
import { useEffect, type JSX } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  showActiveToggle?: boolean;
  /**
   * Lock the voucher's start/end date pickers to the campaign's window.
   * When provided, the date fields are hidden and the voucher's dates are
   * forced to match the campaign window exactly.
   */
  campaignWindow?: { startDate: string; endDate: string } | null;
}

const formatRange = (startIso: string, endIso: string): string => {
  const fmt = (raw: string): string => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const pad = (n: number): string => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  return `${fmt(startIso)} → ${fmt(endIso)}`;
};

export const VoucherForm = ({
  showActiveToggle = true,
  campaignWindow,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { control, watch, setValue } = useFormContext<VoucherFormValues>();
  const type = watch('type');

  const lockedToCampaign = campaignWindow != null;

  useEffect(() => {
    if (!campaignWindow) return;
    setValue('startDate', campaignWindow.startDate, {
      shouldDirty: false,
      shouldValidate: false,
    });
    setValue('endDate', campaignWindow.endDate, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [campaignWindow, setValue]);

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
      {lockedToCampaign && campaignWindow ? (
        <View className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <Text className="text-xs font-semibold uppercase text-gray-500">
            {t('manager_vouchers.field_start_date')} →{' '}
            {t('manager_vouchers.field_end_date')}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-gray-800">
            {formatRange(campaignWindow.startDate, campaignWindow.endDate)}
          </Text>
          <Text className="mt-1 text-xs text-gray-500">
            {t('manager_vouchers.window_locked_hint')}
          </Text>
        </View>
      ) : (
        <>
          <DateTimeField<VoucherFormValues>
            name="startDate"
            label={t('manager_vouchers.field_start_date')}
            required
            mode="datetime"
          />
          <DateTimeField<VoucherFormValues>
            name="endDate"
            label={t('manager_vouchers.field_end_date')}
            required
            mode="datetime"
          />
        </>
      )}

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
