import type { JSX } from 'react';
import { Text, View } from 'react-native';

interface TitleProps {
  title: string;
}

export const Title = ({ title }: TitleProps): JSX.Element => {
  return (
    <View className="mb-8 px-5">
      <Text className="text-[32px] font-medium">{title}</Text>
      <View className="mt-2 h-[3px] w-[100px] rounded-full bg-[#a1d973]" />
    </View>
  );
};
