import { Ref, type JSX } from 'react';
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Text, View } from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';

import { COLORS } from '@constants/colors';

interface CustomOTPInputProps<T extends FieldValues> {
  ref: Ref<OtpInputRef>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  numberOfDigits?: number;
}

export const CustomOTPInput = <T extends FieldValues>(
  props: CustomOTPInputProps<T>
): JSX.Element => {
  const { ref, name, label, required, numberOfDigits = 6 } = props;
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <View className="flex w-full flex-col gap-2">
          <Text className="text-lg font-semibold text-[#616161]">
            {label}
            {required && <Text className="text-[#FE4763]"> *</Text>}
          </Text>

          <OtpInput
            {...field}
            ref={ref}
            numberOfDigits={numberOfDigits}
            focusColor={COLORS.primary}
            autoFocus={false}
            hideStick={true}
            blurOnFilled={true}
            type="numeric"
            onTextChange={field.onChange}
            onFilled={field.onChange}
            theme={{
              containerStyle: {
                width: '100%',
              },
              pinCodeContainerStyle: {
                borderRadius: 8,
                borderWidth: 1,
                minHeight: 48,
              },
              pinCodeTextStyle: {
                color: COLORS.primary,
              },
            }}
          />
          {fieldState.error && (
            <View style={{ minHeight: 19 }}>
              <Text className="mt-1 text-base text-[#FE4763]">
                {fieldState.error?.message}
              </Text>
            </View>
          )}
        </View>
      )}
    />
  );
};
