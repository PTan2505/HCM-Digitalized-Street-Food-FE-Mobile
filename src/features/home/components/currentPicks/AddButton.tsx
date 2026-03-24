import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';

interface AddButtonProps {
  label: string;
  onPress: () => void;
}

const AddButton = ({ label, onPress }: AddButtonProps): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-9 right-9 flex-row items-center gap-2 rounded-[8px] bg-[#EE6612] px-2 py-2"
    >
      <Ionicons name="add" size={24} color="#fff" />
      <Text className="text-base font-semibold text-white">{label}</Text>
    </TouchableOpacity>
  );
};

export default AddButton;
