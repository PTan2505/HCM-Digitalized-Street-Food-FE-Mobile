import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  title: string;
  value: string | number;
  Icon: LucideIcon;
}

export const SummaryCard = ({ title, value, Icon }: Props): React.JSX.Element => {
  return (
    <View className="flex-1 min-w-[46%] rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text className="mb-1 text-[11px] font-medium text-gray-500" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            {value}
          </Text>
        </View>
        <View className="rounded-xl bg-primary/10 p-2">
          <Icon size={18} color="#06AA4C" strokeWidth={2} />
        </View>
      </View>
    </View>
  );
};
