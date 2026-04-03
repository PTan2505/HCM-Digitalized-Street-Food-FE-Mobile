import { Ionicons } from '@expo/vector-icons';
import type { HomeQuickAction } from '@features/home/config/homeQuickActions';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  actions: HomeQuickAction[];
  sectionTitle?: string;
}

export const QuickActionGrid = ({ actions }: Props): JSX.Element => {
  return (
    <View className="flex-row flex-wrap pt-2">
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={action.onPress}
          activeOpacity={0.75}
          className="w-1/4 items-center px-4 pb-3"
        >
          <View className="mb-2 aspect-square w-full items-center justify-center rounded-2xl bg-[#EE6612]/20">
            <Ionicons
              name={action.ionIcon as 'location'}
              size={32}
              color="#EE6612"
            />
            <Text
              className="text-center text-xs font-bold text-gray-800"
              numberOfLines={2}
            >
              {action.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
