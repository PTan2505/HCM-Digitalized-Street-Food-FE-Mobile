import type { HomeQuickAction } from '@features/customer/home/config/homeQuickActions';
import type { JSX } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

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
          className="w-1/4 items-center px-3 pb-3"
        >
          <View className="mb-2 aspect-square w-full items-center justify-center gap-2 rounded-2xl bg-primary-light/15">
            <Image
              source={action.icon}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Text
              className="text-center text-sm font-bold text-gray-800"
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
