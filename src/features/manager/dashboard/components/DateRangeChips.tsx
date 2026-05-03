import type { DashboardPreset } from '@manager/dashboard/hooks/useManagerDashboard';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  selected: DashboardPreset;
  onSelect: (preset: DashboardPreset) => void;
}

const PRESETS: DashboardPreset[] = [7, 14, 30];

export const DateRangeChips = ({
  selected,
  onSelect,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-2">
      {PRESETS.map((days) => {
        const isSelected = selected === days;
        return (
          <TouchableOpacity
            key={days}
            onPress={() => onSelect(days)}
            className={`rounded-full px-4 py-1.5 ${isSelected ? 'bg-primary' : 'bg-gray-100'}`}
          >
            <Text
              className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-600'}`}
            >
              {t('manager_dashboard.days_preset', { days })}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
