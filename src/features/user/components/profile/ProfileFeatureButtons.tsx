import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@constants/colors';
import { ProfileSectionItem } from '@features/user/types/profileConfig';
import React, { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProfileFeatureButtonsProps {
  items: ProfileSectionItem[];
}

export const ProfileFeatureButtons = ({
  items,
}: ProfileFeatureButtonsProps): JSX.Element => {
  return (
    <View className="flex-row gap-3">
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={item.onPress}
          className="flex-1 items-center rounded-2xl border border-gray-200 bg-white p-4"
        >
          {item.icon && (
            <View
              className="mb-2 h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: item.color
                  ? `${item.color}20`
                  : 'rgba(159, 211, 86, 0.15)',
              }}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={item.color ?? COLORS.primary}
              />
            </View>
          )}
          <Text className="text-center text-sm font-semibold text-gray-900">
            {item.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
