import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';

interface ListHeaderProps {
  title: string;
  sortByLabel: string;
  onSortPress: () => void;
}

const ListHeader = ({
  title,
  sortByLabel,
  onSortPress,
}: ListHeaderProps): JSX.Element => {
  return (
    <View className="mb-4 flex-row items-center justify-between px-4">
      <Text className="text-[16px] font-semibold text-black">{title}</Text>
      <TouchableOpacity
        onPress={onSortPress}
        className="h-[26px] w-[97px] flex-row items-center justify-center gap-1.5 rounded-[16px] bg-[#ECECEC]"
      >
        <Ionicons name="options-outline" size={14} color="#666" />
        <Text className="text-[10px] text-gray-600">{sortByLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeader;
