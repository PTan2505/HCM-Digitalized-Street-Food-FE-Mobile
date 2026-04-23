import type { JSX } from 'react';
import React from 'react';
import { Text, View } from 'react-native';

interface TitleSectionProps {
  title: string;
  numberLabel: string;
  locationsCount: number;
  locationsLabel: string;
  expiresLabel: string;
  days: number;
  hours: number;
  minutes: number;
  daysLabel: string;
  hoursLabel: string;
  minutesLabel: string;
}

const TitleSection = ({
  title,
  numberLabel,
  locationsCount,
  locationsLabel,
  expiresLabel,
  days,
  hours,
  minutes,
  daysLabel,
  hoursLabel,
  minutesLabel,
}: TitleSectionProps): JSX.Element => {
  return (
    <View
      className="px-4 pt-2"
      style={{
        shadowColor: '#CAC4C4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text className="mb-2 text-[20px] font-semibold leading-[22px] text-black">
        {title} {numberLabel}
      </Text>
      <Text className="mb-2 text-base text-gray-400">
        {locationsCount} {locationsLabel}
      </Text>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="mr-2 text-base font-medium text-[#086524]">
          {expiresLabel}
        </Text>
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
    </View>
  );
};

export default TitleSection;
