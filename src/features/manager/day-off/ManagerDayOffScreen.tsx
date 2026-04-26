import Header from '@components/Header';
import type { DayOff } from '@manager/day-off/api/managerDayOffApi';
import {
  useDeleteDayOff,
  useManagerDayOffList,
} from '@manager/day-off/hooks/useManagerDayOff';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const DayOffItem = ({
  item,
  onDelete,
}: {
  item: DayOff;
  onDelete: (id: number) => void;
}): JSX.Element => {
  const { t } = useTranslation();
  const timeRange =
    item.startTime && item.endTime
      ? `${item.startTime.slice(0, 5)} – ${item.endTime.slice(0, 5)}`
      : t('manager_day_off.full_day');

  return (
    <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
      <View className="flex-1 gap-1">
        <Text className="text-sm font-semibold text-gray-900">
          {formatDate(item.startDate)}
          {item.startDate !== item.endDate
            ? ` – ${formatDate(item.endDate)}`
            : ''}
        </Text>
        <Text className="text-xs text-gray-500">{timeRange}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onDelete(item.dayOffId)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="ml-3 p-1"
      >
        <FontAwesome6 name="trash" size={16} color="#EF4444" />
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
        secondaryAction={{
          label: t('manager_day_off.add'),
          onPress: () => navigation.navigate('ManagerAddDayOff'),
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#006a2c" />
        </View>
      ) : (
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
              <FontAwesome6 name="calendar-xmark" size={40} color="#D1D5DB" />
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
      )}
    </SafeAreaView>
  );
};
