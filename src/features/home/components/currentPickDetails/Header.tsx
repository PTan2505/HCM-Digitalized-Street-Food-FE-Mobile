import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';

interface HeaderProps {
  onBackPress: () => void;
  onMenuPress: () => void;
}

const Header = ({ onBackPress, onMenuPress }: HeaderProps): JSX.Element => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <TouchableOpacity className="p-1" onPress={onBackPress}>
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity className="p-1" onPress={onMenuPress}>
        <Ionicons name="ellipsis-horizontal" size={28} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
