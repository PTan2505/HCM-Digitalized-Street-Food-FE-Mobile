import Header from '@components/Header';
import { useCreateDayOff } from '@manager/day-off/hooks/useManagerDayOff';
import {
  getDayOffSchema,
  type DayOffFormValues,
} from '@manager/day-off/utils/dayOffSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FormField = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}): JSX.Element => (
  <View className="mb-4">
    <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
    {children}
    {hint && !error ? (
      <Text className="mt-1 text-xs text-gray-400">{hint}</Text>
    ) : null}
    {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
  </View>
);

export const AddDayOffScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createDayOff = useCreateDayOff();
  const [isFullDay, setIsFullDay] = useState(true);

  const schema = useMemo(() => getDayOffSchema(t), [t]);

  const {
    control,
    handleSubmit,
    setValue,
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

  const onSubmit = (values: DayOffFormValues): void => {
    createDayOff.mutate(
      {
        startDate: values.startDate,
        endDate: values.endDate,
        startTime: values.isFullDay ? null : (values.startTime ?? null),
        endTime: values.isFullDay ? null : (values.endTime ?? null),
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
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField
            label={t('manager_day_off.start_date')}
            hint={t('manager_day_off.date_format_hint')}
            error={errors.startDate?.message}
          >
            <Controller
              control={control}
              name="startDate"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="2025-12-31"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('manager_day_off.end_date')}
            hint={t('manager_day_off.date_format_hint')}
            error={errors.endDate?.message}
          >
            <Controller
              control={control}
              name="endDate"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="2025-12-31"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              )}
            />
          </FormField>

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
                hint={t('manager_day_off.time_format_hint')}
                error={errors.startTime?.message}
              >
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="08:00"
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                    />
                  )}
                />
              </FormField>

              <FormField
                label={t('manager_day_off.end_time')}
                hint={t('manager_day_off.time_format_hint')}
                error={errors.endTime?.message}
              >
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="17:00"
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                    />
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
