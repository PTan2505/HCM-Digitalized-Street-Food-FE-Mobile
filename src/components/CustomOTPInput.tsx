import { type JSX } from 'react';
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Text, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

interface CustomOTPInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  numberOfDigits?: number;
}

export const CustomOTPInput = <T extends FieldValues>(
  props: CustomOTPInputProps<T>
): JSX.Element => {
  const { name, label, required, numberOfDigits = 6 } = props;
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <View className="flex w-full flex-col gap-2">
          <Text className="text-base font-semibold text-[#616161]">
            {label}
            {required && <Text className="text-[#FE4763]"> *</Text>}
          </Text>

          <OtpInput
            numberOfDigits={numberOfDigits}
            onTextChange={field.onChange}
            onFilled={field.onChange}
            focusColor={
              field.value?.length > 0 && !fieldState.error
                ? '#a1d973'
                : '#E5E5E5'
            }
            theme={{
              containerStyle: {
                width: '100%',
              },
              pinCodeContainerStyle: {
                borderRadius: 8,
                borderWidth: 1,
                borderColor:
                  field.value?.length > 0 && !fieldState.error
                    ? '#a1d973'
                    : '#E5E5E5',
                minHeight: 48,
              },
              pinCodeTextStyle: {
                color: '#a1d973',
              },
              focusStickStyle: {
                backgroundColor: '#a1d973',
              },
            }}
          />
          {fieldState.error && (
            <View style={{ minHeight: 19 }}>
              <Text className="mt-1 text-sm text-[#FE4763]">
                {fieldState.error?.message}
              </Text>
            </View>
          )}
        </View>
      )}
    />
  );
};
