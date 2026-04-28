import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';

interface Props {
  minDate: string;
  visible: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onConfirm: (start: string, end: string) => void;
  onClose: () => void;
}

const PRIMARY = '#9FD356';
const PRIMARY_LIGHT = 'rgba(159, 211, 86, 0.22)';

export const DatePickerModal = ({
  minDate,
  visible,
  startDate,
  endDate,
  onConfirm,
  onClose,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  useEffect(() => {
    if (visible) {
      setTempStart(startDate);
      setTempEnd(endDate);
    }
  }, [visible, startDate, endDate]);

  const onDayPress = (day: DateData): void => {
    const dateString = day.dateString;

    if (!tempStart || (tempStart && tempEnd)) {
      // Start a fresh selection
      setTempStart(dateString);
      setTempEnd('');
    } else if (dateString < tempStart) {
      // If user picks a date before the start, reset start to that date
      setTempStart(dateString);
      setTempEnd('');
    } else if (dateString > tempStart) {
      // Complete the range
      setTempEnd(dateString);
    }
  };

  // Generate the "markedDates" object for the Period UI
  const getMarkedDates = (): MarkedDates => {
    if (!tempStart) return {};

    const marked: MarkedDates = {
      [tempStart]: { startingDay: true, color: PRIMARY, textColor: 'white' },
    };

    if (tempEnd) {
      marked[tempEnd] = { endingDay: true, color: PRIMARY, textColor: 'white' };

      // Fill in the days between
      const start = new Date(tempStart);
      const end = new Date(tempEnd);

      for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (dateStr !== tempStart && dateStr !== tempEnd) {
          marked[dateStr] = { color: PRIMARY_LIGHT, textColor: '#1F2937' };
        }
      }
    }
    return marked;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onClose}
      >
        <View className="w-80 rounded-2xl bg-white p-4 shadow-lg">
          <Calendar
            minDate={minDate}
            markingType={'period'}
            markedDates={getMarkedDates()}
            onDayPress={onDayPress}
            theme={{
              todayTextColor: PRIMARY,
              arrowColor: '#4B5563',
              textMonthFontWeight: 'bold',
            }}
          />

          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-full border border-gray-200 py-3"
              onPress={onClose}
            >
              <Text className="text-center text-sm text-gray-600">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-full py-3 ${tempStart && tempEnd ? 'bg-primary' : 'bg-gray-200'}`}
              disabled={!tempStart || !tempEnd}
              onPress={() => {
                onConfirm(tempStart, tempEnd);
              }}
            >
              <Text className="text-center text-sm font-bold text-white">
                {t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
