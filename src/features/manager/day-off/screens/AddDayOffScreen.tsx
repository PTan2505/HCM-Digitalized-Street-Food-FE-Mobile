import { DateTimeField } from '@components/DateTimeField';
import Header from '@components/Header';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreateDayOff,
  useManagerDayOffList,
} from '@manager/day-off/hooks/useManagerDayOff';
import {
  getDayOffSchema,
  type DayOffFormValues,
} from '@manager/day-off/utils/dayOffSchema';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState, type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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

export const AddDayOffScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createDayOff = useCreateDayOff();
  const existingDayOffs = useManagerDayOffList();
  const [isFullDay, setIsFullDay] = useState(true);

  const schema = useMemo(() => getDayOffSchema(t), [t]);

  const methods = useForm<DayOffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: '',
      endDate: '',
      isFullDay: true,
      startTime: '',
      endTime: '',
    },
  });

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = methods;

  const today = useMemo(() => new Date(), []);

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

    createDayOff.mutate(
      {
        startDate: finalStart,
        endDate: finalEnd,
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
      setValue('startTime', '08:00', { shouldValidate: true });
      setValue('endTime', '17:00', { shouldValidate: true });
    }
  };

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
        <FormProvider {...methods}>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <DateTimeField<DayOffFormValues>
              name="startDate"
              label={t('manager_day_off.start_date')}
              required
              mode="date"
              valueFormat="date-only"
              minimumDate={today}
            />
            <DateTimeField<DayOffFormValues>
              name="endDate"
              label={t('manager_day_off.end_date')}
              required
              mode="date"
              valueFormat="date-only"
              minimumDate={today}
            />

            <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
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
                <DateTimeField<DayOffFormValues>
                  name="startTime"
                  label={t('manager_day_off.start_time')}
                  required
                  mode="time"
                />
                <DateTimeField<DayOffFormValues>
                  name="endTime"
                  label={t('manager_day_off.end_time')}
                  required
                  mode="time"
                />
              </>
            ) : null}

            {errors.startDate?.message ? (
              <Text className="text-xs text-red-500">
                {errors.startDate.message}
              </Text>
            ) : null}

            <TouchableOpacity
              className="mt-2 items-center rounded-full bg-primary py-3"
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
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
