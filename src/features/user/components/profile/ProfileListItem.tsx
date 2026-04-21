import { Ionicons } from '@expo/vector-icons';
import { ProfileSectionItem } from '@features/user/types/profileConfig';
import React, { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProfileListItemProps {
  item: ProfileSectionItem;
  isLastItem?: boolean;
}

export const ProfileListItem = ({
  item,
  isLastItem = false,
}: ProfileListItemProps): JSX.Element => {
  return (
    <Pressable
      onPress={item.onPress}
      className={`flex-row items-center bg-white px-4 py-4 ${!isLastItem ? 'border-b border-gray-100' : ''}`}
    >
      {item.icon && (
        <View className="mr-3">
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={item.color ?? '#666'}
          />
        </View>
      )}

      <View className="flex-1">
        <View className="flex-row items-center">
          <Text
            className="text-base"
            style={{ color: item.color ?? '#1F2937' }}
          >
            {item.title}
          </Text>
          {item.badge && (
            <View
              className="ml-2 rounded-full px-2 py-0.5"
              style={{
                backgroundColor: item.badgeColor ?? '#FF6B6B',
              }}
            >
              <Text className="text-sm font-semibold text-white">
                {item.badge}
              </Text>
            </View>
          )}
        </View>
        {item.subtitle && (
          <Text className="mt-0.5 text-base text-gray-500">
            {item.subtitle}
          </Text>
        )}
      </View>

      <View className="flex-row items-center">
        {item.rightText && (
          <Text className="mr-2 text-base text-gray-600">{item.rightText}</Text>
        )}
        {item.rightIcon && (
          <Ionicons
            name={item.rightIcon as keyof typeof Ionicons.glyphMap}
            size={20}
            color="#999"
          />
        )}
      </View>
    </Pressable>
  );
};
