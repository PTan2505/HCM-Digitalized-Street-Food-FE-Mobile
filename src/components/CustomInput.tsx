import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type JSX } from 'react';
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

const INPUT_ICONS: Record<
  string,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  email: 'email-outline',
  phone: 'phone-outline',
  password: 'lock-outline',
  username: 'account-circle-outline',
  name: 'account-outline',
  // You can add 'text' here if you want a default icon, or leave it out
};

interface CustomInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  readonly?: boolean;
  type?: 'email' | 'phone' | 'password' | 'username' | 'name' | 'text';
}

export const CustomInput = <T extends FieldValues>(
  props: CustomInputProps<T>
): JSX.Element => {
  const {
    name,
    label,
    required,
    placeholder,
    type = 'text',
    keyboardType,
    readonly,
  } = props;
  const [hidePassword, setHidePassword] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const { control } = useFormContext();

  // Determine keyboard type automatically if not provided explicitly
  const getKeyboardType = (): KeyboardTypeOptions => {
    if (keyboardType) return keyboardType;
    if (type === 'email') return 'email-address';
    if (type === 'phone') return 'phone-pad';
    return 'default';
  };

  const iconName = INPUT_ICONS[type];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <View className="flex w-full flex-col gap-1">
          <Text className="text-lg font-semibold text-[#616161]">
            {label}
            {required && <Text className="text-[#FE4763]"> *</Text>}
          </Text>

          <View
            className={
              'flex-row items-center gap-3 border-b-2 pb-2 ' +
              (fieldState.error
                ? 'border-b-[#FE4763]'
                : isFocused
                  ? 'border-b-primary'
                  : 'border-b-[#E5E5E5]')
            }
          >
            {iconName && (
              <View className="h-5 w-5 items-center justify-center">
                <MaterialCommunityIcons
                  name={iconName}
                  size={20} // Slightly increased size for visibility
                  color="#999999"
                />
              </View>
            )}

            <TextInput
              {...field}
              ref={field.ref}
              onFocus={() => setIsFocused(true)}
              onChangeText={field.onChange}
              onBlur={() => {
                setIsFocused(false);
                field.onBlur();
              }}
              placeholder={placeholder}
              placeholderTextColor="#BDBDBD"
              secureTextEntry={type === 'password' ? hidePassword : false}
              autoCapitalize={type === 'email' ? 'none' : 'sentences'}
              keyboardType={getKeyboardType()}
              textAlignVertical="center"
              autoFocus={props.autoFocus}
              className={`flex-1 justify-center py-3 text-[#333333] ${
                readonly ? 'bg-gray-100 opacity-60' : 'bg-transparent'
              }`}
              editable={!readonly} // Control việc có cho gõ hay không
              selectTextOnFocus={!readonly}
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
                    size={20}
                    color="#999999"
                  />
                </View>
              </Pressable>
            )}
          </View>

          {fieldState.error && (
            <Text className="mt-1 text-base text-[#FE4763]">
              {fieldState.error?.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};
