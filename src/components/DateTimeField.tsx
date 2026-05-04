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

type Mode = 'date' | 'datetime' | 'time';
/** How to serialize the picked date back into the value string. */
type ValueFormat =
  | 'iso' // full ISO Z (e.g. 2026-05-04T08:00:00.000Z) — default for date/datetime
  | 'date-only' // YYYY-MM-DD — only valid with mode='date'
  | 'time-only'; // HH:mm — implicit when mode='time'

interface CommonProps {
  label?: string;
  required?: boolean;
  mode?: Mode;
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
  /** Override the value serialization format. */
  valueFormat?: ValueFormat;
  /** Optional inline error to display when used in non-form mode. */
  errorMessage?: string;
}

interface ControlledProps extends CommonProps {
  value: string;
  onChange: (next: string) => void;
}

interface FormProps<T extends FieldValues> extends CommonProps {
  name: FieldPath<T>;
}

type Props<T extends FieldValues> = FormProps<T> | ControlledProps;

const pad = (n: number): string => n.toString().padStart(2, '0');

/** Parse a stored string back into a Date for the picker. */
const parseValue = (raw: string, mode: Mode): Date | null => {
  if (!raw) return null;
  if (mode === 'time') {
    const m = /^(\d{1,2}):(\d{2})/.exec(raw);
    if (!m) return null;
    const d = new Date();
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    return d;
  }
  // date / datetime — accept full ISO or YYYY-MM-DD
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

/** Serialize a picked Date into the storage format. */
const serializeValue = (d: Date, mode: Mode, format: ValueFormat): string => {
  if (mode === 'time' || format === 'time-only') {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (format === 'date-only') {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return d.toISOString();
};

const formatDisplay = (raw: string, mode: Mode): string => {
  if (!raw) return '';
  if (mode === 'time') {
    const m = /^(\d{1,2}):(\d{2})/.exec(raw);
    return m ? `${pad(Number(m[1]))}:${m[2]}` : '';
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // fall back to raw if not parseable
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  if (mode === 'date') return date;
  return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isFormProps = <T extends FieldValues>(p: Props<T>): p is FormProps<T> =>
  'name' in p;

/** Internal renderer — receives a value and an onChange (form or controlled). */
const FieldBody = ({
  value,
  onChange,
  label,
  required,
  mode,
  minimumDate,
  maximumDate,
  clearable,
  valueFormat,
  errorMessage,
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  required?: boolean;
  mode: Mode;
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
  valueFormat: ValueFormat;
  errorMessage?: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const [show, setShow] = useState<'date' | 'time' | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const valueDate = parseValue(value, mode);

  const handleChange = (event: DateTimePickerEvent, selected?: Date): void => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShow(null);
        setPendingDate(null);
        return;
      }
      if (mode === 'time' && selected) {
        onChange(serializeValue(selected, mode, valueFormat));
        setShow(null);
        return;
      }
      if (show === 'date' && selected) {
        if (mode === 'date') {
          onChange(serializeValue(selected, mode, valueFormat));
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
        onChange(serializeValue(merged, mode, valueFormat));
        setShow(null);
        setPendingDate(null);
      }
    } else if (selected) {
      // iOS: inline picker, just update value
      onChange(serializeValue(selected, mode, valueFormat));
    }
  };

  const open = (): void => {
    if (Platform.OS === 'android') {
      setShow(mode === 'time' ? 'time' : 'date');
    } else {
      setShow(show === null ? (mode === 'time' ? 'time' : 'date') : null);
    }
  };

  const handleClear = (): void => {
    onChange('');
  };

  const display = formatDisplay(value, mode);
  const placeholderKey =
    mode === 'time'
      ? 'date_time.placeholder_time'
      : mode === 'datetime'
        ? 'date_time.placeholder_datetime'
        : 'date_time.placeholder_date';
  const iosMode = mode === 'datetime' ? 'datetime' : mode;

  return (
    <View className="flex w-full flex-col gap-1">
      {label ? (
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-[#616161]">
            {label}
            {required && <Text className="text-[#FE4763]"> *</Text>}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={open}
        className={`flex-row items-center gap-3 border-b-2 pb-1 ${
          errorMessage ? 'border-b-[#FE4763]' : 'border-b-[#E5E5E5]'
        }`}
      >
        <View className="h-6 w-6 items-center justify-center">
          <MaterialCommunityIcons
            name={mode === 'time' ? 'clock-outline' : 'calendar-outline'}
            size={20}
            color="#999999"
          />
        </View>
        <Text
          className={`flex-1 py-3 ${display ? 'text-[#333333]' : 'text-[#BDBDBD]'}`}
        >
          {display || t(placeholderKey)}
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

      {errorMessage ? (
        <Text className="mt-1 text-base text-[#FE4763]">{errorMessage}</Text>
      ) : null}

      {/* iOS inline picker */}
      {Platform.OS === 'ios' && show !== null ? (
        <View className="mt-2 rounded-xl bg-gray-50 p-2">
          <DateTimePicker
            value={valueDate ?? new Date()}
            mode={iosMode}
            display={mode === 'time' ? 'spinner' : 'inline'}
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
};

export const DateTimeField = <T extends FieldValues>(
  props: Props<T>
): JSX.Element => {
  const mode: Mode = props.mode ?? 'datetime';
  const valueFormat: ValueFormat =
    props.valueFormat ?? (mode === 'time' ? 'time-only' : 'iso');

  if (isFormProps(props)) {
    return (
      <FormFieldVariant<T>
        name={props.name}
        label={props.label}
        required={props.required}
        mode={mode}
        minimumDate={props.minimumDate}
        maximumDate={props.maximumDate}
        clearable={props.clearable}
        valueFormat={valueFormat}
      />
    );
  }
  return (
    <FieldBody
      value={props.value}
      onChange={props.onChange}
      label={props.label}
      required={props.required}
      mode={mode}
      minimumDate={props.minimumDate}
      maximumDate={props.maximumDate}
      clearable={props.clearable}
      valueFormat={valueFormat}
      errorMessage={props.errorMessage}
    />
  );
};

interface FormFieldVariantProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  required?: boolean;
  mode: Mode;
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
  valueFormat: ValueFormat;
}

const FormFieldVariant = <T extends FieldValues>({
  name,
  label,
  required,
  mode,
  minimumDate,
  maximumDate,
  clearable,
  valueFormat,
}: FormFieldVariantProps<T>): JSX.Element => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldBody
          value={field.value ?? ''}
          onChange={field.onChange}
          label={label}
          required={required}
          mode={mode}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          clearable={clearable}
          valueFormat={valueFormat}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
};
