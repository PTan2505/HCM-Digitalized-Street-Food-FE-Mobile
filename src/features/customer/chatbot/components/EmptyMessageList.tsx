import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import foodImage from '@assets/images/food.png';

const SUGGESTION_CHIPS = [
  'Gợi ý món gần tôi',
  'Món chay ngon',
  'Cơm tấm ở đâu?',
  'Đồ ăn dưới 50k',
];

type Props = {
  onSuggestionPress: (text: string) => void;
};

export const EmptyMessageList = ({
  onSuggestionPress,
}: Props): React.JSX.Element => (
  <View className="flex-1 items-center justify-center px-6 py-8">
    <Image source={foodImage} className="mb-6 h-48 w-48" resizeMode="contain" />
    <Text className="title-lg mb-1 text-center text-gray-800">
      Xin chào! Tôi là Lowca AI
    </Text>
    <Text className="mb-8 text-center text-sm leading-5 text-gray-400">
      Hỏi tôi về món ăn, địa điểm gần bạn,{'\n'}hay thực đơn phù hợp khẩu vị.
    </Text>
    <View className="w-full flex-row flex-wrap justify-center gap-2">
      {SUGGESTION_CHIPS.map((chip) => (
        <TouchableOpacity
          key={chip}
          onPress={() => onSuggestionPress(chip)}
          activeOpacity={0.7}
          className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2"
        >
          <Text className="text-sm font-medium text-primary">{chip}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
