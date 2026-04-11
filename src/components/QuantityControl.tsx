import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const QuantityControl = ({
  quantity,
  onIncrement,
  onDecrement,
}: QuantityControlProps): JSX.Element => {
  return (
    <View className="flex-row items-center rounded-full bg-gray-100">
      <TouchableOpacity
        onPress={onDecrement}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons name="remove-circle" size={32} color={COLORS.primary} />
      </TouchableOpacity>
      <Text className="min-w-[28px] text-center text-base font-semibold text-black">
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons name="add-circle" size={32} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};
