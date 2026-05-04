import Header from '@components/Header';
import type { DayOff } from '@manager/day-off/api/managerDayOffApi';
import {
  useDeleteDayOff,
  useManagerDayOffList,
} from '@manager/day-off/hooks/useManagerDayOff';
import { useNavigation } from '@react-navigation/native';
import { CalendarPlus, CalendarX } from 'lucide-react-native';
import React, { useCallback, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getDateInfo = (
  startISO: string,
  endISO: string,
  language: string
): { dayDisplay: string; monthDisplay: string; isMultiDay: boolean } => {
  const startStr = startISO.split('T')[0] ?? '';
  const endStr = endISO.split('T')[0] ?? '';
  const [startY, startM, startD] = startStr.split('-');
  const [, , endD] = endStr.split('-');
  const isSameDay = startStr === endStr;
  const monthIdx = parseInt(startM ?? '1', 10) - 1;
  const date = new Date(parseInt(startY ?? '2024', 10), monthIdx, 1);
  const monthDisplay = new Intl.DateTimeFormat(language, {
    month: 'short',
  }).format(date);
  const dayDisplay = isSameDay
    ? String(parseInt(startD ?? '1', 10))
    : `${parseInt(startD ?? '1', 10)}-${parseInt(endD ?? '1', 10)}`;
  return { dayDisplay, monthDisplay, isMultiDay: !isSameDay };
};

interface DayOffItemProps {
  item: DayOff;
  onDelete: (id: number) => void;
}

export const DayOffItem = ({
  item,
  onDelete,
}: DayOffItemProps): JSX.Element => {
  const { t, i18n } = useTranslation();
  const [startDateStr = '', startTimeFull = '00:00:00'] =
    item.startDate.split('T');
  const [endDateStr = '', endTimeFull = '23:59:59'] = item.endDate.split('T');
  const formatDate = (d: string): string => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };
  const { dayDisplay, monthDisplay, isMultiDay } = getDateInfo(
    item.startDate,
    item.endDate,
    i18n.language
  );

  return (
    <View className="mb-3 flex-row items-center justify-between rounded-xl bg-white px-4 py-4">
      <View className="flex-1 flex-row items-center gap-4">
        <View
          className={`h-16 items-center justify-center rounded-xl ${isMultiDay ? 'min-w-[64px] px-3' : 'w-16'}`}
          style={{
            backgroundColor: isMultiDay ? 'rgba(119,253,147,0.4)' : '#77fd93',
          }}
        >
          <Text
            style={{ color: '#005f27' }}
            className="text-xl font-bold leading-none"
          >
            {dayDisplay}
          </Text>
          <Text
            style={{ color: '#005f27' }}
            className="mt-1 text-[10px] font-bold uppercase tracking-widest"
          >
            {monthDisplay}
          </Text>
        </View>

        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-gray-900">
            {t('manager_day_off.from')}
            {'  '}
            {startTimeFull.slice(0, 5)}
            {'  '}
            {formatDate(startDateStr)}
          </Text>
          <Text className="text-sm text-gray-400">
            {t('manager_day_off.to')}
            {'    '}
            {endTimeFull.slice(0, 5)}
            {'  '}
            {formatDate(endDateStr)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onDelete(item.dayOffId)}
        activeOpacity={0.7}
        className="ml-2 rounded-full px-4 py-2"
        style={{ backgroundColor: '#ffc5ab' }}
      >
        <Text style={{ color: '#7c2f00' }} className="text-sm font-semibold">
          {t('manager_day_off.cancel')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const ManagerDayOffScreen = (): JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { data: dayOffs, isLoading } = useManagerDayOffList();
  const deleteDayOff = useDeleteDayOff();

  const handleDelete = useCallback(
    (dayOffId: number) => {
      Alert.alert(
        t('manager_day_off.delete_confirm_title'),
        t('manager_day_off.delete_confirm_message'),
        [
          { text: t('manager_day_off.cancel'), style: 'cancel' },
          {
            text: t('manager_day_off.delete'),
            style: 'destructive',
            onPress: (): void =>
              deleteDayOff.mutate(dayOffId, {
                onError: (): void =>
                  void Alert.alert(t('manager_day_off.error_delete')),
              }),
          },
        ]
      );
    },
    [deleteDayOff, t]
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_day_off.title')}
        onBackPress={
          navigation.canGoBack() ? (): void => navigation.goBack() : undefined
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#006a2c" />
        </View>
      ) : (
        <View className="flex-1 pb-4">
          <View className="px-4 pb-4 pt-2">
            <Text className="text-sm text-gray-500">
              {t('manager_day_off.subtitle')}
            </Text>
          </View>

          <View
            className="mx-4 flex-1 overflow-hidden rounded-3xl"
            style={{ backgroundColor: '#c6fdd9' }}
          >
            <FlatList
              data={dayOffs ?? []}
              keyExtractor={(item) => String(item.dayOffId)}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 32,
                flexGrow: 1,
              }}
              renderItem={({ item }) => (
                <DayOffItem item={item} onDelete={handleDelete} />
              )}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center gap-2 py-16">
                  <CalendarX size={40} color="#D1D5DB" />
                  <Text className="text-base font-semibold text-gray-400">
                    {t('manager_day_off.empty')}
                  </Text>
                  <Text className="text-center text-sm text-gray-400">
                    {t('manager_day_off.empty_subtitle')}
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('ManagerAddDayOff')}
        activeOpacity={0.9}
        className="absolute bottom-8 right-6 flex-row items-center gap-3 rounded-full bg-primary px-6 py-4"
        style={{
          elevation: 8,
          shadowColor: '#006a2c',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }}
      >
        <CalendarPlus size={20} color="white" />
        <Text className="text-sm font-bold text-white">
          {t('manager_day_off.add')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
