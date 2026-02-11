import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { JSX } from 'react';

interface PickCardProps {
  id: string;
  title: string;
  locations: string;
  days: number;
  hours: number;
  minutes: number;
  image: ImageSourcePropType;
  onPress: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: () => void;
  daysLabel: string;
  hoursLabel: string;
  minutesLabel: string;
}

const PickCard = ({
  id,
  title,
  locations,
  days,
  hours,
  minutes,
  image,
  onPress,
  onEdit,
  onDelete,
  onShare,
  daysLabel,
  hoursLabel,
  minutesLabel,
}: PickCardProps): JSX.Element => {
  const renderRightActions = (): JSX.Element => {
    return (
      <View className="flex-row">
        <TouchableOpacity
          className="w-[65px] items-center justify-center bg-[#E1FFC2]"
          onPress={() => onEdit(id)}
        >
          <Ionicons name="pencil-outline" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[65px] items-center justify-center bg-[#B1EE73]"
          onPress={() => onDelete(id)}
        >
          <Ionicons name="trash-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center border-b border-gray-100 bg-white p-4"
      >
        <View className="relative mr-4">
          <View
            className="absolute -left-2 top-3 h-[63px] w-[63px] rounded-[6px] bg-[#EE66127D] opacity-60"
            style={{ transform: [{ rotate: '-15deg' }] }}
          />
          <View
            className="absolute -right-2 -top-1 h-[63px] w-[63px] rounded-[6px] bg-[#E1FFC280] opacity-60"
            style={{ transform: [{ rotate: '15deg' }] }}
          />
          <Image
            source={image}
            className="h-[80px] w-[80px] rounded-xl bg-gray-100"
          />
        </View>

        <View className="flex-1 justify-center">
          <Text className="mb-3 text-[14px] font-semibold text-black">
            {title}
          </Text>
          <Text className="mb-3 text-[10px] text-gray-500">{locations}</Text>

          <View className="flex-row items-center">
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                {String(days).padStart(2, '0')} {daysLabel}
              </Text>
            </View>
            <Text className="mx-1.5 text-base font-semibold text-[#1D7518]">
              :
            </Text>
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                {String(hours).padStart(2, '0')} {hoursLabel}
              </Text>
            </View>
            <Text className="mx-1.5 text-base font-semibold text-[#1D7518]">
              :
            </Text>
            <View className="h-[18px] w-[49px] items-center justify-center rounded-md border-[0.95px] border-[#1D7518] bg-white">
              <Text className="text-[9.45px] font-semibold leading-[100%] text-[#1D7518]">
                {String(minutes).padStart(2, '0')} {minutesLabel}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="ml-2 p-2" onPress={onShare}>
          <Ionicons name="share-social-outline" size={24} color="#000" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default PickCard;
