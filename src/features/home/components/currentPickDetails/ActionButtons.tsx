import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';

interface ActionButtonsProps {
  mapLabel: string;
  shareLabel: string;
  randomPickLabel: string;
  onMapPress: () => void;
  onSharePress: () => void;
  onRandomPickPress: () => void;
}

const ActionButtons = ({
  mapLabel,
  shareLabel,
  randomPickLabel,
  onMapPress,
  onSharePress,
  onRandomPickPress,
}: ActionButtonsProps): JSX.Element => {
  return (
    <View className="mb-5 mt-4 flex-row gap-2 px-4">
      <TouchableOpacity
        onPress={onMapPress}
        className="h-[26px] w-[87px] flex-row items-center justify-center gap-1.5 rounded-[16px] bg-[#FFFFFF]"
        style={{
          shadowColor: '#CAC4C4',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="map-outline" size={20} color="#000" />
        <Text className="text-[12px] font-medium text-black">{mapLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSharePress}
        className="h-[26px] w-[87px] flex-row items-center justify-center gap-1.5 rounded-[16px] bg-[#FFFFFF]"
        style={{
          shadowColor: '#CAC4C4',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="share-social-outline" size={20} color="#000" />
        <Text className="text-[12px] font-medium text-black">{shareLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRandomPickPress}
        className="h-[26px] flex-1 flex-row items-center justify-center gap-1.5 rounded-[16px] border-[1px] border-[#1D7518] bg-white"
        style={{
          shadowColor: '#CAC4C4',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="dice-outline" size={20} color="#1D7518" />
        <Text className="text-[12px] font-medium text-black">
          {randomPickLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;
