import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type JSX } from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <View className="flex w-full flex-col gap-1">
          <Text className="text-base font-medium text-[#616161]">
            {label}
            {required && <Text className="text-[#FE4763]"> *</Text>}
          </Text>

          <View
            className={
              'flex-row items-center gap-3 border-b-2 pb-2 ' +
              (fieldState.error
                ? 'border-b-[#FE4763]'
                : isFocused
                  ? 'border-b-[#a1d973]'
                  : 'border-b-[#E5E5E5]')
            }
          >
            <View className="h-5 w-5 items-center justify-center">
              {type === 'email' && (
                <View className="h-5 w-5 items-center justify-center">
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={15}
                    color="#999999"
                  />
                </View>
              )}
              {type === 'phone' && (
                <View className="h-5 w-5 items-center justify-center">
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={15}
                    color="#999999"
                  />
                </View>
              )}
              {type === 'password' && (
                <View className="h-5 w-5 items-center justify-center">
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={15}
                    color="#999999"
                  />
                </View>
              )}
              {type === 'username' && (
                <View className="h-5 w-5 items-center justify-center">
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={15}
                    color="#999999"
                  />
                </View>
              )}
              {type === 'name' && (
                <View className="h-5 w-5 items-center justify-center">
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={15}
                    color="#999999"
                  />
                </View>
              )}
            </View>

            <TextInput
              ref={field.ref}
              value={(field.value ?? '') as string}
              onChangeText={field.onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                field.onBlur();
              }}
              placeholder={placeholder}
              placeholderTextColor="#BDBDBD"
              secureTextEntry={type === 'password' ? hidePassword : false}
              autoCapitalize={type === 'email' ? 'none' : 'sentences'}
              keyboardType={
                type === 'email'
                  ? 'email-address'
                  : type === 'phone'
                    ? 'phone-pad'
                    : 'default'
              }
              textAlignVertical="center"
              className="flex-1 py-3 text-base text-[#333333]"
            />

            {type === 'password' && (
              <Pressable
                onPress={() => setHidePassword((prev) => !prev)}
                accessibilityRole="button"
                hitSlop={8}
              >
                <View className="h-5 w-5 items-center justify-center">
                  <MaterialCommunityIcons
                    name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                    size={15}
                    color="#999999"
                  />
                </View>
              </Pressable>
            )}
          </View>

          {fieldState.error && (
            <Text className="mt-1 text-sm text-[#FE4763]">
              {fieldState.error?.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};
