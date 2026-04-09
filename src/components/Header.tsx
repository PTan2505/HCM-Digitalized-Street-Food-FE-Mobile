import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  secondaryAction?: {
    label: string;
    icon: JSX.Element;
    onPress: () => void;
  };
}

const Header = ({
  title,
  onBackPress,
  secondaryAction,
}: HeaderProps): JSX.Element => {
  return (
    <View className="flex-row items-center justify-between px-4 pb-4 pt-1">
      {onBackPress && (
        <TouchableOpacity
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
      )}
      <View
        className="absolute left-0 right-0 items-center"
        pointerEvents="none"
      >
        <Text className="text-2xl font-bold text-gray-900">{title}</Text>
      </View>
      {secondaryAction && (
        <TouchableOpacity
          className="flex-row items-center gap-3 rounded-full bg-gray-200 px-3 py-1"
          onPress={secondaryAction.onPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text>{secondaryAction.label}</Text>
          {secondaryAction.icon}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;
