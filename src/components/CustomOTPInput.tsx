import { OtpInput } from 'react-native-otp-entry';
import { type JSX } from 'react';
import { Text, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface CustomOTPInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  numberOfDigits?: number;
}

export const CustomOTPInput = <T extends FieldValues>(
  props: CustomOTPInputProps<T>
): JSX.Element => {
  const { name, control, label, required, numberOfDigits = 6 } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <View className="flex w-full flex-col gap-2">
          <Text className="title-medium text-primary-900">
            {label}
            {required && <Text className="text-required"> *</Text>}
          </Text>

          <OtpInput
            numberOfDigits={numberOfDigits}
            onTextChange={field.onChange}
            onFilled={field.onChange}
            focusColor={
              field.value?.length > 0 && !fieldState.error
                ? '#1A1A1A'
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
                    ? '#1A1A1A'
                    : '#E5E5E5',
                minHeight: 48,
              },
              pinCodeTextStyle: {
                color: '#1A1A1A',
              },
              focusStickStyle: {
                backgroundColor: '#1A1A1A',
              },
            }}
          />

          <View style={{ minHeight: 19 }}>
            <Text className="body-medium text-[#FE4763]">
              {fieldState.error?.message}
            </Text>
          </View>
        </View>
      )}
    />
  );
};
