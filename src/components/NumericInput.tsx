import { type JSX, useState } from 'react';
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

interface NumericInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  allowDecimal?: boolean;
  suffix?: string;
}

const formatThousands = (value: string): string => {
  if (!value) return '';
  const parts = value.split('.');
  const head = parts[0] ?? '';
  const tail = parts.length > 1 ? `.${parts[1]}` : '';
  return head.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + tail;
};

const sanitize = (raw: string, allowDecimal: boolean): string => {
  let cleaned = raw.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  if (!allowDecimal) cleaned = cleaned.replace(/\./g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return cleaned;
};

export const NumericInput = <T extends FieldValues>(
  props: NumericInputProps<T>
): JSX.Element => {
  const {
    name,
    label,
    required,
    placeholder,
    allowDecimal = false,
    suffix,
  } = props;
  const { control } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const numeric = field.value as number | null | undefined;
        const display =
          numeric === null || numeric === undefined
            ? ''
            : formatThousands(String(numeric));

        const handleChange = (raw: string): void => {
          const sanitized = sanitize(raw, allowDecimal);
          if (sanitized === '') {
            field.onChange(null);
            return;
          }
          const num = allowDecimal
            ? parseFloat(sanitized)
            : parseInt(sanitized, 10);
          field.onChange(isNaN(num) ? null : num);
        };

        return (
          <View className="flex w-full flex-col gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-[#616161]">
                {label}
                {required && <Text className="text-[#FE4763]"> *</Text>}
              </Text>
            </View>
            <View
              className={`flex-row items-center gap-2 border-b-2 pb-1 ${
                fieldState.error
                  ? 'border-b-[#FE4763]'
                  : isFocused
                    ? 'border-b-primary'
                    : 'border-b-[#E5E5E5]'
              }`}
            >
              <TextInput
                value={display}
                onChangeText={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  field.onBlur();
                }}
                placeholder={placeholder}
                placeholderTextColor="#BDBDBD"
                keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
                className="flex-1 py-3 text-[#333333]"
              />
              {suffix ? (
                <Text className="pr-2 text-base text-[#999999]">{suffix}</Text>
              ) : null}
            </View>
            {fieldState.error && (
              <Text className="mt-1 text-base text-[#FE4763]">
                {fieldState.error?.message}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
};
