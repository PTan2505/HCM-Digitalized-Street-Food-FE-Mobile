import type { DashboardPreset } from '@manager/dashboard/hooks/useManagerDashboard';
import { buildDateRange } from '@manager/dashboard/hooks/useManagerDashboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  fromDate: string;
  toDate: string;
  preset: DashboardPreset | null;
  onChange: (next: { fromDate: string; toDate: string }) => void;
  onPresetChange: (preset: DashboardPreset) => void;
}

const PRESETS: DashboardPreset[] = [7, 30, 90];

const pad = (n: number): string => n.toString().padStart(2, '0');

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const startOfDay = (d: Date): Date => {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (d: Date): Date => {
  const next = new Date(d);
  next.setHours(23, 59, 59, 999);
  return next;
};

const sameDay = (a: string, b: string): boolean => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

export const DateRangeFilter = ({
  fromDate,
  toDate,
  preset,
  onChange,
  onPresetChange,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);
  const [draftFrom, setDraftFrom] = useState<Date>(new Date(fromDate));
  const [draftTo, setDraftTo] = useState<Date>(new Date(toDate));

  // Keep drafts in sync when applied range changes externally (e.g. preset press)
  useEffect(() => {
    setDraftFrom(new Date(fromDate));
  }, [fromDate]);
  useEffect(() => {
    setDraftTo(new Date(toDate));
  }, [toDate]);

  const draftFromIso = startOfDay(draftFrom).toISOString();
  const draftToIso = endOfDay(draftTo).toISOString();
  const isDirty =
    !sameDay(draftFromIso, fromDate) || !sameDay(draftToIso, toDate);

  const openPicker = (which: 'from' | 'to'): void => {
    setShowPicker(which);
  };

  const handlePicked = (
    which: 'from' | 'to',
    _event: unknown,
    date?: Date
  ): void => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
    if (!date) return;
    if (which === 'from') {
      const next = startOfDay(date);
      setDraftFrom(next);
      if (next.getTime() > draftTo.getTime()) {
        setDraftTo(endOfDay(date));
      }
    } else {
      const next = endOfDay(date);
      setDraftTo(next);
      if (next.getTime() < draftFrom.getTime()) {
        setDraftFrom(startOfDay(date));
      }
    }
  };

  const handleApply = (): void => {
    onChange({
      fromDate: startOfDay(draftFrom).toISOString(),
      toDate: endOfDay(draftTo).toISOString(),
    });
  };

  const handlePresetPress = (days: DashboardPreset): void => {
    onPresetChange(days);
    onChange(buildDateRange(days));
  };

  const presetLabel = (days: DashboardPreset): string =>
    days === 90
      ? t('manager_dashboard.last_three_months')
      : t('manager_dashboard.last_n_days', { days });

  return (
    <View className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => openPicker('from')}
          className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
        >
          <Calendar size={14} color="#6B7280" />
          <View className="flex-1">
            <Text className="text-[10px] font-semibold text-gray-500 uppercase">
              {t('manager_dashboard.from_date')}
            </Text>
            <Text className="text-sm text-gray-800">
              {formatDate(draftFromIso)}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => openPicker('to')}
          className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
        >
          <Calendar size={14} color="#6B7280" />
          <View className="flex-1">
            <Text className="text-[10px] font-semibold text-gray-500 uppercase">
              {t('manager_dashboard.to_date')}
            </Text>
            <Text className="text-sm text-gray-800">
              {formatDate(draftToIso)}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={handleApply}
          disabled={!isDirty}
          className={`rounded-lg px-4 py-2 ${
            isDirty ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              isDirty ? 'text-white' : 'text-gray-400'
            }`}
          >
            {t('manager_dashboard.apply')}
          </Text>
        </Pressable>
      </View>

      <View className="mt-3 flex-row gap-2">
        {PRESETS.map((days) => {
          const isSelected = preset === days;
          return (
            <Pressable
              key={days}
              onPress={() => handlePresetPress(days)}
              className={`flex-1 items-center rounded-full px-3 py-1.5 ${
                isSelected ? 'bg-primary' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? 'text-white' : 'text-gray-600'
                }`}
              >
                {presetLabel(days)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showPicker !== null && (
        <DateTimePicker
          value={showPicker === 'from' ? draftFrom : draftTo}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={(event, date) =>
            handlePicked(showPicker, event, date ?? undefined)
          }
        />
      )}
      {Platform.OS === 'ios' && showPicker !== null && (
        <Pressable
          onPress={() => setShowPicker(null)}
          className="mt-2 self-end rounded-lg bg-primary px-4 py-2"
        >
          <Text className="text-xs font-semibold text-white">
            {t('common.done', { defaultValue: 'OK' })}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
