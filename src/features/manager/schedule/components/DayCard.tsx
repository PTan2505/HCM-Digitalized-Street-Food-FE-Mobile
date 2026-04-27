import { Ionicons } from '@expo/vector-icons';
import type { WorkSchedule } from '@manager/schedule/api/managerScheduleApi';
import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface DayInfo {
  key: number;
  shortKey: string;
  nameKey: string;
  isWeekend: boolean;
}

interface DayCardProps {
  day: DayInfo;
  slots: WorkSchedule[];
  onAddSlot: () => void;
  onEditSlot: (schedule: WorkSchedule) => void;
  onDeleteSlot: (scheduleId: number) => void;
}

export const DayCard = ({
  day,
  slots,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}: DayCardProps): JSX.Element => {
  const { t } = useTranslation();
  const isOpen = slots.length > 0;

  const circleStyle = isOpen
    ? day.isWeekend
      ? 'bg-[#ffc5ab]'
      : 'bg-[#77fd93]'
    : 'bg-gray-200';

  const circleTextStyle = isOpen
    ? day.isWeekend
      ? 'text-[#5d2200]'
      : 'text-[#004a1d]'
    : 'text-gray-500';

  const statusText = isOpen
    ? day.isWeekend
      ? t('manager_schedule.weekend')
      : t('manager_schedule.open')
    : t('manager_schedule.closed');

  const statusTextStyle = isOpen ? 'text-[#38644b]' : 'text-[#b02500]';

  return (
    <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        {/* Day label */}
        <View className="flex-row items-center gap-3">
          <View
            className={`h-12 w-12 items-center justify-center rounded-full ${circleStyle}`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-wider ${circleTextStyle}`}
            >
              {t(`manager_schedule.weekdays_short.${day.shortKey}`)}
            </Text>
          </View>
          <View>
            <Text className="text-base font-bold text-[#043620]">
              {t(`manager_schedule.weekdays.${day.nameKey}`)}
            </Text>
            <Text className={`text-xs font-medium ${statusTextStyle}`}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Add button */}
        <TouchableOpacity
          onPress={onAddSlot}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="add-outline" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Time slot chips */}
      {slots.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {slots.map((slot) => (
            <TouchableOpacity
              key={`slot-${slot.workScheduleId}`}
              onPress={() => onEditSlot(slot)}
              className="flex-row items-center gap-1.5 rounded-lg bg-[#baf6cf] px-3 py-1.5"
            >
              <Text className="text-sm font-medium text-[#004a1d]">
                {slot.openTime.substring(0, 5)} –{' '}
                {slot.closeTime.substring(0, 5)}
              </Text>
              <TouchableOpacity
                onPress={() => onDeleteSlot(slot.workScheduleId)}
                hitSlop={8}
              >
                <Text className="text-sm font-bold text-[#38644b]">✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text className="ml-1 mt-2 text-xs italic text-gray-400">
          {t('manager_schedule.no_shifts')}
        </Text>
      )}
    </View>
  );
};
