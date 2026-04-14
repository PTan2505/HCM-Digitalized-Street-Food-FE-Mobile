import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  return (
    <View
      className="justify-end bg-white pb-2"
      style={{ paddingTop: insets.top }}
    >
      <View className="h-10 flex-row items-center justify-between px-4">
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
    </View>
  );
};

export default Header;
