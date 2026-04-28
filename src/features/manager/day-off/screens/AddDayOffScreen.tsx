import Header from '@components/Header';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePickerModal } from '@manager/day-off/components/DatePickerModal';
import {
  useCreateDayOff,
  useManagerDayOffList,
} from '@manager/day-off/hooks/useManagerDayOff';
import {
  getDayOffSchema,
  type DayOffFormValues,
} from '@manager/day-off/utils/dayOffSchema';
import { TimeScrollPicker } from '@manager/schedule/components/TimeScrollPicker';
import { useNavigation } from '@react-navigation/native';
import { CalendarDays } from 'lucide-react-native';
import React, { useMemo, useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}): JSX.Element => (
  <View className="mb-4">
    <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
    {children}
    {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
  </View>
);

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const formatTime = (h: number, m: number): string =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

export const AddDayOffScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createDayOff = useCreateDayOff();
  const existingDayOffs = useManagerDayOffList();
  const [isFullDay, setIsFullDay] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(17);
  const [endMinute, setEndMinute] = useState(0);

  const schema = useMemo(() => getDayOffSchema(t), [t]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<DayOffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: '',
      endDate: '',
      isFullDay: true,
      startTime: '',
      endTime: '',
    },
  });
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const onSubmit = (values: DayOffFormValues): void => {
    let finalStart: string;
    let finalEnd: string;

    if (values.isFullDay) {
      finalStart = `${values.startDate}T00:00:00`;
      finalEnd = `${values.endDate}T23:59:59`;
    } else {
      finalStart = `${values.startDate}T${values.startTime ?? '00:00'}:00`;
      finalEnd = `${values.endDate}T${values.endTime ?? '23:59'}:00`;
    }

    // 2. Overlap Check (using full DateTime values)
    const finalStartMs = new Date(finalStart).getTime();
    const finalEndMs = new Date(finalEnd).getTime();
    const hasOverlap = existingDayOffs.data?.some((d) => {
      const existingStartMs = new Date(d.startDate).getTime();
      const existingEndMs = new Date(d.endDate).getTime();
      return finalStartMs <= existingEndMs && existingStartMs <= finalEndMs;
    });

    if (hasOverlap) {
      setError('startDate', { message: t('manager_day_off.error_overlap') });
      return;
    }

    // 3. Send to API
    createDayOff.mutate(
      {
        startDate: finalStart, // Now a full DateTime string
        endDate: finalEnd, // Now a full DateTime string
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: () => Alert.alert(t('manager_day_off.error_save')),
      }
    );
  };

  const handleFullDayToggle = (value: boolean): void => {
    setIsFullDay(value);
    setValue('isFullDay', value);
    if (value) {
      setValue('startTime', '');
      setValue('endTime', '');
    } else {
      setValue('startTime', formatTime(startHour, startMinute), {
        shouldValidate: true,
      });
      setValue('endTime', formatTime(endHour, endMinute), {
        shouldValidate: true,
      });
    }
  };

  const dateRangeError = errors.startDate?.message ?? errors.endDate?.message;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_day_off.add_title')}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Date range picker */}
          <FormField
            label={t('manager_day_off.date_range')}
            error={dateRangeError}
          >
            <TouchableOpacity
              className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              onPress={() => setPickerVisible(true)}
              activeOpacity={0.7}
            >
              <CalendarDays size={18} color="#6B7280" />
              <Text
                className={`ml-3 text-base ${startDate ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {startDate || t('manager_day_off.start_date')}
              </Text>
              <Ionicons
                className="px-2"
                name="arrow-forward"
                size={14}
                color="#9ca3af"
              />
              <Text
                className={`flex-1 text-base ${endDate ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {endDate || t('manager_day_off.end_date')}
              </Text>
            </TouchableOpacity>

            <DatePickerModal
              minDate={today}
              visible={pickerVisible}
              startDate={startDate}
              endDate={endDate}
              onConfirm={(start: string, end: string) => {
                setValue('startDate', start, { shouldValidate: true });
                setValue('endDate', end, { shouldValidate: true });
                setPickerVisible(false);
              }}
              onClose={() => setPickerVisible(false)}
            />
          </FormField>

          {/* Full day toggle */}
          <View className="mb-4 flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <Text className="text-base text-gray-700">
              {t('manager_day_off.full_day')}
            </Text>
            <Switch
              value={isFullDay}
              onValueChange={handleFullDayToggle}
              trackColor={{ true: '#9FD356' }}
            />
          </View>

          {!isFullDay ? (
            <>
              <FormField
                label={t('manager_day_off.start_time')}
                error={errors.startTime?.message}
              >
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field: { onChange } }) => (
                    <View className="flex-row items-center justify-center gap-2">
                      <TimeScrollPicker
                        values={HOURS}
                        value={startHour}
                        onChange={(hour) => {
                          setStartHour(hour);
                          onChange(formatTime(hour, startMinute));
                        }}
                      />
                      <Text className="mb-1 text-3xl font-bold text-[#006a2c]">
                        :
                      </Text>
                      <TimeScrollPicker
                        values={MINUTES}
                        value={startMinute}
                        onChange={(minute) => {
                          setStartMinute(minute);
                          onChange(formatTime(startHour, minute));
                        }}
                      />
                    </View>
                  )}
                />
              </FormField>

              <FormField
                label={t('manager_day_off.end_time')}
                error={errors.endTime?.message}
              >
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field: { onChange } }) => (
                    <View className="flex-row items-center justify-center gap-2">
                      <TimeScrollPicker
                        values={HOURS}
                        value={endHour}
                        onChange={(hour) => {
                          setEndHour(hour);
                          onChange(formatTime(hour, endMinute));
                        }}
                      />
                      <Text className="mb-1 text-3xl font-bold text-[#006a2c]">
                        :
                      </Text>
                      <TimeScrollPicker
                        values={MINUTES}
                        value={endMinute}
                        onChange={(minute) => {
                          setEndMinute(minute);
                          onChange(formatTime(endHour, minute));
                        }}
                      />
                    </View>
                  )}
                />
              </FormField>
            </>
          ) : null}

          <TouchableOpacity
            className="mt-4 items-center rounded-full bg-primary py-3"
            onPress={handleSubmit(onSubmit)}
            disabled={createDayOff.isPending}
          >
            <Text className="text-base font-bold text-white">
              {createDayOff.isPending
                ? t('manager_day_off.saving')
                : t('manager_day_off.save')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
