import { AnimatedBackdrop } from '@components/AnimatedBackdrop';
import type { WorkSchedule } from '@manager/schedule/api/managerScheduleApi';
import { TimeScrollPicker } from '@manager/schedule/components/TimeScrollPicker';
import React, { useCallback, useEffect, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const parseTime = (time: string): [number, number] => {
  const parts = time.split(':').map(Number);
  return [parts[0] ?? 9, parts[1] ?? 0];
};

const formatTime = (h: number, m: number): string =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

const toMinutes = (time: string): number => {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
};

interface AddEditSlotModalProps {
  visible: boolean;
  weekdayLabel: string;
  schedule?: WorkSchedule;
  existingSlots: WorkSchedule[];
  onClose: () => void;
  onSave: (openTime: string, closeTime: string) => void;
}

export const AddEditSlotModal = ({
  visible,
  weekdayLabel,
  schedule,
  existingSlots,
  onClose,
  onSave,
}: AddEditSlotModalProps): JSX.Element | null => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const progress = useSharedValue(0);

  const [openHour, setOpenHour] = useState(9);
  const [openMinute, setOpenMinute] = useState(0);
  const [closeHour, setCloseHour] = useState(22);
  const [closeMinute, setCloseMinute] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      const [oh, om] = schedule ? parseTime(schedule.openTime) : [9, 0];
      const [ch, cm] = schedule ? parseTime(schedule.closeTime) : [22, 0];
      setOpenHour(oh);
      setOpenMinute(om);
      setCloseHour(ch);
      setCloseMinute(cm);
      setError('');
      setResetKey((k) => k + 1);
      setMounted(true);
      progress.value = withTiming(1, { duration: 280 });
      return undefined;
    }
    progress.value = withTiming(0, { duration: 220 });
    const timer = setTimeout(() => setMounted(false), 220);
    return (): void => clearTimeout(timer);
    // progress is a stable ref — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, schedule]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [500, 0]) }],
  }));

  const handleSave = useCallback(() => {
    const openTime = formatTime(openHour, openMinute);
    const closeTime = formatTime(closeHour, closeMinute);

    if (closeTime <= openTime) {
      setError(t('manager_schedule.error_close_before_open'));
      return;
    }

    const overlaps = existingSlots
      .filter((s) => s.workScheduleId !== schedule?.workScheduleId)
      .some((s) => {
        const eStart = toMinutes(s.openTime.substring(0, 5));
        const eEnd = toMinutes(s.closeTime.substring(0, 5));
        const nStart = toMinutes(openTime);
        const nEnd = toMinutes(closeTime);
        return nStart < eEnd && nEnd > eStart;
      });

    if (overlaps) {
      setError(t('manager_schedule.error_overlap'));
      return;
    }

    setError('');
    onSave(openTime, closeTime);
  }, [openHour, openMinute, closeHour, closeMinute, existingSlots, schedule, onSave, t]);

  const title = `${schedule ? t('manager_schedule.edit_slot') : t('manager_schedule.add_slot')} · ${weekdayLabel}`;

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <AnimatedBackdrop
        mounted={mounted}
        visible={visible}
        onPress={onClose}
        progress={progress}
      />
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View className="rounded-t-2xl bg-white px-6 pb-8 pt-4">
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />

          <Text className="mb-5 text-base font-bold text-[#043620]">{title}</Text>

          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#38644b]">
            {t('manager_schedule.open_time')}
          </Text>
          <View className="mb-4 flex-row items-center justify-center gap-2">
            <TimeScrollPicker
              key={`open-h-${resetKey}`}
              values={HOURS}
              value={openHour}
              onChange={setOpenHour}
            />
            <Text className="mb-1 text-3xl font-bold text-[#006a2c]">:</Text>
            <TimeScrollPicker
              key={`open-m-${resetKey}`}
              values={MINUTES}
              value={openMinute}
              onChange={setOpenMinute}
            />
          </View>

          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#38644b]">
            {t('manager_schedule.close_time')}
          </Text>
          <View className="mb-2 flex-row items-center justify-center gap-2">
            <TimeScrollPicker
              key={`close-h-${resetKey}`}
              values={HOURS}
              value={closeHour}
              onChange={setCloseHour}
            />
            <Text className="mb-1 text-3xl font-bold text-[#006a2c]">:</Text>
            <TimeScrollPicker
              key={`close-m-${resetKey}`}
              values={MINUTES}
              value={closeMinute}
              onChange={setCloseMinute}
            />
          </View>

          {error ? (
            <Text className="mb-2 text-center text-xs text-[#b02500]">{error}</Text>
          ) : (
            <View className="mb-2" style={{ height: 16 }} />
          )}

          <View className="mt-2 flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 items-center justify-center rounded-xl border border-gray-200 py-3"
            >
              <Text className="text-sm font-semibold text-gray-600">
                {t('manager_schedule.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 items-center justify-center rounded-xl bg-[#006a2c] py-3"
            >
              <Text className="text-sm font-bold text-white">
                {t('manager_schedule.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
