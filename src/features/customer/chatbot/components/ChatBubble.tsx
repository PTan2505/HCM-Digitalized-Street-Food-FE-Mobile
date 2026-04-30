import React from 'react';
import { Image, Text, View } from 'react-native';

type Props = {
  role: 'user' | 'bot';
  text: string;
  imageUri?: string;
};

export const ChatBubble = ({
  role,
  text,
  imageUri,
}: Props): React.JSX.Element => {
  const isUser = role === 'user';

  return (
    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      <View className="max-w-[85%] ">
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            className="mb-3 h-48 w-48 self-end rounded-2xl"
            resizeMode="cover"
          />
        )}
        {text.trim().length > 0 && (
          <Text
            className={`rounded-2xl px-4 py-3 text-base leading-6 text-gray-900  ${
              isUser
                ? 'rounded-tr-none bg-primary/20'
                : 'rounded-tl-none border border-gray-200 bg-gray-50'
            }`}
          >
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};
