import { DateTimeField } from '@components/DateTimeField';
import type { WorkSchedule } from '@manager/schedule/api/managerScheduleApi';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_TOP = SCREEN_HEIGHT * 0.2;
const MODAL_HEIGHT = SCREEN_HEIGHT - SHEET_TOP;
const CLOSE_THRESHOLD = MODAL_HEIGHT * 0.5;
const SPRING = { damping: 20, stiffness: 200, mass: 0.8 } as const;

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
  const dragY = useSharedValue(MODAL_HEIGHT);

  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [error, setError] = useState('');

  // Slide down then unmount on close; prepare state and mount on open
  useEffect(() => {
    if (visible) {
      setOpenTime(schedule ? schedule.openTime.substring(0, 5) : '09:00');
      setCloseTime(schedule ? schedule.closeTime.substring(0, 5) : '22:00');
      setError('');
      dragY.value = MODAL_HEIGHT;
      setMounted(true);
      return undefined;
    }
    dragY.value = withSpring(MODAL_HEIGHT, SPRING);
    const timer = setTimeout(() => setMounted(false), 400);
    return (): void => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, schedule]);

  // Slide up once the component is mounted and rendered off-screen
  useEffect(() => {
    if (mounted) dragY.value = withSpring(0, SPRING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (e.translationY > 0) dragY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD) {
        onClose();
      } else {
        dragY.value = withSpring(0, SPRING);
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      dragY.value,
      [0, MODAL_HEIGHT],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const handleSave = useCallback(() => {
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
  }, [openTime, closeTime, existingSlots, schedule, onSave, t]);

  const title = `${schedule ? t('manager_schedule.edit_slot') : t('manager_schedule.add_slot')} · ${weekdayLabel}`;

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          backdropAnimatedStyle,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: SHEET_TOP,
            left: 0,
            right: 0,
            height: MODAL_HEIGHT,
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 10,
          },
          sheetAnimatedStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View className="items-center pb-2 pt-3">
            <View className="h-1 w-10 rounded-full bg-gray-300" />
          </Animated.View>
        </GestureDetector>

        <View className="px-6 pb-8">
          <Text className="mb-5 text-base font-bold text-[#043620]">
            {title}
          </Text>

          <View className="mb-4">
            <DateTimeField
              label={t('manager_schedule.open_time')}
              mode="time"
              value={openTime}
              onChange={setOpenTime}
            />
          </View>

          <View className="mb-2">
            <DateTimeField
              label={t('manager_schedule.close_time')}
              mode="time"
              value={closeTime}
              onChange={setCloseTime}
            />
          </View>

          {error ? (
            <Text className="mb-2 text-center text-xs text-[#b02500]">
              {error}
            </Text>
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
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
