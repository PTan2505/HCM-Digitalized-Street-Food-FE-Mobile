import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState, type JSX } from 'react';
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface DateTimeFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  mode?: 'date' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
}

const pad = (n: number): string => n.toString().padStart(2, '0');

const formatDisplay = (iso: string, mode: 'date' | 'datetime'): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  if (mode === 'date') return date;
  return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const DateTimeField = <T extends FieldValues>(
  props: DateTimeFieldProps<T>
): JSX.Element => {
  const {
    name,
    label,
    required,
    mode = 'datetime',
    minimumDate,
    maximumDate,
    clearable,
  } = props;
  const { t } = useTranslation();
  const { control } = useFormContext();
  const [show, setShow] = useState<'date' | 'time' | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const valueIso = (field.value as string) ?? '';
        const valueDate = valueIso ? new Date(valueIso) : null;
        const display = formatDisplay(valueIso, mode);

        const handleChange = (
          event: DateTimePickerEvent,
          selected?: Date
        ): void => {
          if (Platform.OS === 'android') {
            // Android: native dialog - close on event
            if (event.type === 'dismissed') {
              setShow(null);
              setPendingDate(null);
              return;
            }
            if (show === 'date' && selected) {
              if (mode === 'date') {
                field.onChange(selected.toISOString());
                setShow(null);
                setPendingDate(null);
              } else {
                setPendingDate(selected);
                setShow('time');
              }
            } else if (show === 'time' && selected) {
              const base = pendingDate ?? valueDate ?? new Date();
              const merged = new Date(
                base.getFullYear(),
                base.getMonth(),
                base.getDate(),
                selected.getHours(),
                selected.getMinutes()
              );
              field.onChange(merged.toISOString());
              setShow(null);
              setPendingDate(null);
            }
          } else if (selected) {
            // iOS: inline picker, just update value
            field.onChange(selected.toISOString());
          }
        };

        const open = (): void => {
          if (Platform.OS === 'android') {
            setShow('date');
          } else {
            setShow(show === null ? 'date' : null);
          }
        };

        const handleClear = (): void => {
          field.onChange('');
        };

        return (
          <View className="flex w-full flex-col gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-[#616161]">
                {label}
                {required && <Text className="text-[#FE4763]"> *</Text>}
              </Text>
            </View>

            <Pressable
              onPress={open}
              className={`flex-row items-center gap-3 border-b-2 pb-1 ${
                fieldState.error
                  ? 'border-b-[#FE4763]'
                  : 'border-b-[#E5E5E5]'
              }`}
            >
              <View className="h-6 w-6 items-center justify-center">
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={20}
                  color="#999999"
                />
              </View>
              <Text
                className={`flex-1 py-3 ${
                  display ? 'text-[#333333]' : 'text-[#BDBDBD]'
                }`}
              >
                {display ||
                  (mode === 'datetime'
                    ? t('date_time.placeholder_datetime')
                    : t('date_time.placeholder_date'))}
              </Text>
              {clearable && display ? (
                <Pressable onPress={handleClear} hitSlop={8}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color="#999999"
                  />
                </Pressable>
              ) : null}
            </Pressable>

            {fieldState.error && (
              <Text className="mt-1 text-base text-[#FE4763]">
                {fieldState.error?.message}
              </Text>
            )}

            {/* iOS inline picker */}
            {Platform.OS === 'ios' && show !== null ? (
              <View className="mt-2 rounded-xl bg-gray-50 p-2">
                <DateTimePicker
                  value={valueDate ?? new Date()}
                  mode={mode === 'datetime' ? 'datetime' : 'date'}
                  display="inline"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                />
              </View>
            ) : null}

            {/* Android native dialog */}
            {Platform.OS === 'android' && show !== null ? (
              <DateTimePicker
                value={pendingDate ?? valueDate ?? new Date()}
                mode={show}
                display="default"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            ) : null}
          </View>
        );
      }}
    />
  );
};
