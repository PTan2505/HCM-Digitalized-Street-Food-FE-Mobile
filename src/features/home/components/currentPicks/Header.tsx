import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';

interface HeaderProps {
  title: string;
  onBackPress: () => void;
}

const Header = ({ title, onBackPress }: HeaderProps): JSX.Element => {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
      <TouchableOpacity onPress={onBackPress} className="p-1">
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>
      <Text className="text-xl font-semibold text-black">{title}</Text>
      <View className="w-9" />
    </View>
  );
};

export default Header;
