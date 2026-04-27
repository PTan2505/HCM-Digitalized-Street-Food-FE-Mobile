import Header from '@components/Header';
import type { WorkSchedule } from '@manager/schedule/api/managerScheduleApi';
import { AddEditSlotModal } from '@manager/schedule/components/AddEditSlotModal';
import { DayCard } from '@manager/schedule/components/DayCard';
import {
  useCreateWorkSchedule,
  useDeleteWorkSchedule,
  useManagerScheduleList,
  useUpdateWorkSchedule,
} from '@manager/schedule/hooks/useManagerSchedule';
import React, { useCallback, useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API weekday: 0=Sunday, 1=Monday, …, 6=Saturday
const DAYS = [
  { key: 1, shortKey: 'mon', nameKey: 'mon', isWeekend: false },
  { key: 2, shortKey: 'tue', nameKey: 'tue', isWeekend: false },
  { key: 3, shortKey: 'wed', nameKey: 'wed', isWeekend: false },
  { key: 4, shortKey: 'thu', nameKey: 'thu', isWeekend: false },
  { key: 5, shortKey: 'fri', nameKey: 'fri', isWeekend: false },
  { key: 6, shortKey: 'sat', nameKey: 'sat', isWeekend: true },
  { key: 0, shortKey: 'sun', nameKey: 'sun', isWeekend: true },
] as const;

export const ManagerScheduleScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: schedules, isLoading } = useManagerScheduleList();
  const createSchedule = useCreateWorkSchedule();
  const updateSchedule = useUpdateWorkSchedule();
  const deleteSchedule = useDeleteWorkSchedule();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWeekday, setSelectedWeekday] = useState(0);
  const [editingSchedule, setEditingSchedule] = useState<
    WorkSchedule | undefined
  >(undefined);

  const schedulesByDay = useMemo<Record<number, WorkSchedule[]>>(() => {
    const grouped: Record<number, WorkSchedule[]> = {};
    for (let i = 0; i < 7; i++) grouped[i] = [];
    (schedules ?? []).forEach((s) => {
      if (grouped[s.weekday]) grouped[s.weekday].push(s);
    });
    return grouped;
  }, [schedules]);

  const handleAddSlot = useCallback((weekday: number) => {
    setSelectedWeekday(weekday);
    setEditingSchedule(undefined);
    setModalVisible(true);
  }, []);

  const handleEditSlot = useCallback((schedule: WorkSchedule) => {
    setSelectedWeekday(schedule.weekday);
    setEditingSchedule(schedule);
    setModalVisible(true);
  }, []);

  const handleDeleteSlot = useCallback(
    (scheduleId: number) => {
      Alert.alert(
        t('manager_schedule.delete_confirm_title'),
        t('manager_schedule.delete_confirm_message'),
        [
          { text: t('manager_schedule.cancel'), style: 'cancel' },
          {
            text: t('manager_schedule.delete'),
            style: 'destructive',
            onPress: (): void =>
              deleteSchedule.mutate(scheduleId, {
                onError: () => Alert.alert(t('manager_schedule.error_save')),
              }),
          },
        ]
      );
    },
    [deleteSchedule, t]
  );

  const handleSave = useCallback(
    (openTime: string, closeTime: string) => {
      if (editingSchedule) {
        updateSchedule.mutate(
          {
            id: editingSchedule.workScheduleId,
            weekday: editingSchedule.weekday,
            openTime,
            closeTime,
          },
          {
            onSuccess: () => setModalVisible(false),
            onError: () => Alert.alert(t('manager_schedule.error_save')),
          }
        );
      } else {
        createSchedule.mutate(
          { weekdays: [selectedWeekday], openTime, closeTime },
          {
            onSuccess: () => setModalVisible(false),
            onError: () => Alert.alert(t('manager_schedule.error_save')),
          }
        );
      }
    },
    [editingSchedule, selectedWeekday, createSchedule, updateSchedule, t]
  );

  const weekdayLabel = t(
    `manager_schedule.weekdays.${DAYS.find((d) => d.key === selectedWeekday)?.nameKey ?? 'mon'}`
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header title={t('manager_schedule.title')} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#006a2c" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {DAYS.map((day) => (
            <DayCard
              key={`day-${day.key}`}
              day={day}
              slots={schedulesByDay[day.key] ?? []}
              onAddSlot={() => handleAddSlot(day.key)}
              onEditSlot={handleEditSlot}
              onDeleteSlot={handleDeleteSlot}
            />
          ))}
        </ScrollView>
      )}

      <AddEditSlotModal
        visible={modalVisible}
        weekdayLabel={weekdayLabel}
        schedule={editingSchedule}
        existingSlots={schedulesByDay[selectedWeekday] ?? []}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
};
