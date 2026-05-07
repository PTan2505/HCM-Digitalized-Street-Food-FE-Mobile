import type { LucideIcon } from 'lucide-react-native';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export interface TrendItem {
  value: number;
  isPositive: boolean;
  label?: string;
}

interface Props {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  trend?: TrendItem;
}

const TrendBadge = ({ item }: { item: TrendItem }): React.JSX.Element => {
  const abs = Math.abs(item.value);
  const isNeutral = item.value === 0;
  const formatted = isNeutral
    ? '0%'
    : `${item.isPositive ? '+' : '-'}${abs.toFixed(2).replace(/\.?0+$/, '')}%`;

  return (
    <View className="mt-2 flex-row flex-wrap items-center gap-1">
      <View
        className={`flex-row items-center gap-0.5 rounded-full px-2 py-0.5 ${
          isNeutral
            ? 'bg-gray-100'
            : item.isPositive
              ? 'bg-emerald-50'
              : 'bg-red-50'
        }`}
      >
        {isNeutral ? (
          <Minus size={10} strokeWidth={2.5} color="#6b7280" />
        ) : item.isPositive ? (
          <TrendingUp size={10} strokeWidth={2.5} color="#047857" />
        ) : (
          <TrendingDown size={10} strokeWidth={2.5} color="#dc2626" />
        )}
        <Text
          className={`text-[10px] font-bold ${
            isNeutral
              ? 'text-gray-500'
              : item.isPositive
                ? 'text-emerald-700'
                : 'text-red-600'
          }`}
        >
          {formatted}
        </Text>
      </View>
      {item.label ? (
        <Text className="text-[10px] text-gray-400" numberOfLines={1}>
          {item.label}
        </Text>
      ) : null}
    </View>
  );
};

export const SummaryCard = ({
  title,
  value,
  Icon,
  trend,
}: Props): React.JSX.Element => {
  return (
    <View className="min-w-[46%] flex-1 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            className="mb-1 text-[11px] font-medium text-gray-500"
            numberOfLines={1}
          >
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
      {trend ? <TrendBadge item={trend} /> : null}
    </View>
  );
};
