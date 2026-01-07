import { useState, type JSX } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface CustomInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}

export const CustomInput = <T extends FieldValues>(
  props: CustomInputProps<T>
): JSX.Element => {
  const { name, control, label, required, placeholder, type } = props;
  const [hidePassword, setHidePassword] = useState(true);

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

          <View
            className={
              'flex-row items-center gap-2 rounded-md border px-3 py-2 ' +
              (field.value?.length > 0 && !fieldState.error
                ? 'border-primary-1000'
                : 'border-primary-200')
            }
          >
            <TextInput
              ref={field.ref}
              value={(field.value ?? '') as string}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              secureTextEntry={type === 'password' ? hidePassword : false}
              autoCapitalize={type === 'email' ? 'none' : 'sentences'}
              keyboardType={type === 'email' ? 'email-address' : 'default'}
              className={
                'text-primary-900 flex-1 ' +
                (field.value?.length > 0 && !fieldState.error
                  ? 'text-primary-1000'
                  : '')
              }
            />

            {type === 'password' && (
              <Pressable
                onPress={() => setHidePassword((prev) => !prev)}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text className="body-medium text-primary-600">
                  {hidePassword ? 'Hiện' : 'Ẩn'}
                </Text>
              </Pressable>
            )}
          </View>

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
