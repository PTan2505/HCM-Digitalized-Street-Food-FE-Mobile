import type { TopDish } from '@manager/dashboard/api/managerDashboardApi';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  dishes: TopDish[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const TopDishesCard = ({
  dishes,
  isLoading,
  isError,
  onRetry,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-3 text-base font-bold text-gray-900">
        {t('manager_dashboard.top_dishes_title')}
      </Text>
      {isLoading ? (
        <ActivityIndicator color="#9FD356" />
      ) : isError ? (
        <View className="items-center py-2">
          <Text className="mb-2 text-sm text-gray-400">
            {t('manager_dashboard.load_error')}
          </Text>
          <TouchableOpacity onPress={onRetry}>
            <Text className="text-sm font-semibold text-primary">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : !dishes?.length ? (
        <Text className="py-2 text-center text-sm text-gray-400">
          {t('manager_dashboard.no_data')}
        </Text>
      ) : (
        dishes.slice(0, 5).map((dish, idx) => (
          <View
            key={dish.dishId}
            className="flex-row items-center justify-between border-b border-gray-50 py-2 last:border-0"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Text className="text-xs font-bold text-primary">
                  {idx + 1}
                </Text>
              </View>
              <Text
                className="max-w-[200px] text-sm text-gray-800"
                numberOfLines={1}
              >
                {dish.dishName}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-gray-600">
              x{dish.totalQuantityOrdered}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};
