import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, type JSX } from 'react';
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

const COUNTRY_CODES = [
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
];

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
  } = props;
  const [hidePassword, setHidePassword] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const { control } = useFormContext();

  // Extract local phone number without country code
  const getLocalPhoneNumber = (
    fullNumber: string,
    countryCode: string
  ): string => {
    if (!fullNumber) return '';
    if (fullNumber.startsWith(countryCode)) {
      return fullNumber.slice(countryCode.length);
    }
    return fullNumber;
  };

  // Handle country change
  const handleCountryChange = (
    country: (typeof COUNTRY_CODES)[0],
    currentValue: string,
    onChange: (value: string) => void
  ): void => {
    const localNumber = getLocalPhoneNumber(currentValue, selectedCountry.code);
    setSelectedCountry(country);
    onChange(country.code + localNumber);
    setShowCountryPicker(false);
  };

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
            {iconName && (
              <View className="h-5 w-5 items-center justify-center">
                <MaterialCommunityIcons
                  name={iconName}
                  size={20} // Slightly increased size for visibility
                  color="#999999"
                />
              </View>
            )}

            {type === 'phone' && (
              <>
                <Pressable
                  onPress={() => setShowCountryPicker(true)}
                  className="flex-row items-center gap-1 rounded-lg bg-gray-100 px-3 active:opacity-50"
                >
                  <Text className="text-lg">{selectedCountry.flag}</Text>
                  <Text className="text-base font-medium text-[#333333]">
                    {selectedCountry.code}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={16}
                    color="#999999"
                  />
                </Pressable>

                <Modal
                  visible={showCountryPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCountryPicker(false)}
                >
                  <Pressable
                    className="flex-1 bg-black/50"
                    onPress={() => setShowCountryPicker(false)}
                  >
                    <View className="mt-auto rounded-t-3xl bg-white">
                      <View className="border-b border-gray-200 p-4">
                        <Text className="text-center text-lg font-semibold">
                          Chọn quốc gia
                        </Text>
                      </View>
                      <ScrollView className="max-h-96">
                        {COUNTRY_CODES.map((country) => (
                          <Pressable
                            key={country.code}
                            onPress={() =>
                              handleCountryChange(
                                country,
                                field.value as string,
                                field.onChange
                              )
                            }
                            className={`flex-row items-center gap-3 border-b border-gray-100 p-4 active:bg-gray-50 ${
                              selectedCountry.code === country.code
                                ? 'bg-green-50'
                                : ''
                            }`}
                          >
                            <Text className="text-2xl">{country.flag}</Text>
                            <Text className="flex-1 text-base font-medium text-[#333333]">
                              {country.country}
                            </Text>
                            <Text className="text-base text-[#666666]">
                              {country.code}
                            </Text>
                            {selectedCountry.code === country.code && (
                              <MaterialCommunityIcons
                                name="check"
                                size={20}
                                color="#a1d973"
                              />
                            )}
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </Pressable>
                </Modal>
              </>
            )}

            <TextInput
              ref={field.ref}
              value={
                type === 'phone'
                  ? getLocalPhoneNumber(
                      (field.value ?? '') as string,
                      selectedCountry.code
                    )
                  : ((field.value ?? '') as string)
              }
              onChangeText={(text) => {
                if (type === 'phone') {
                  field.onChange(selectedCountry.code + text);
                } else {
                  field.onChange(text);
                }
              }}
              onFocus={() => setIsFocused(true)}
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
              className="flex-1 justify-center py-3 text-[#333333]"
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
            <Text className="mt-1 text-sm text-[#FE4763]">
              {fieldState.error?.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};
