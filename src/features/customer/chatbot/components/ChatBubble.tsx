import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  role: 'user' | 'bot';
  text: string;
};

export const ChatBubble = ({ role, text }: Props): React.JSX.Element => {
  const isUser = role === 'user';

  return (
    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-tr-none bg-primary/20'
            : 'rounded-tl-none border border-gray-200 bg-gray-50'
        }`}
      >
        <Text className="text-base leading-6 text-gray-900">{text}</Text>
      </View>
    </View>
  );
};
