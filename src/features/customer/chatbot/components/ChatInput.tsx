import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  onSend: (text: string) => void;
  isLoading: boolean;
};

export const ChatInput = ({ onSend, isLoading }: Props): React.JSX.Element => {
  const [text, setText] = useState('');

  const handleSend = (): void => {
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
  };

  const canSend = !isLoading && text.trim().length > 0;

  return (
    <View className="flex-row items-center rounded-3xl border border-gray-200 bg-white px-4 py-3">
      <TextInput
        className="flex-1 text-gray-900"
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#72796d"
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline={false}
        editable={!isLoading}
        textAlignVertical="center"
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        className={`ml-2 h-8 w-8 items-center justify-center rounded-full ${canSend ? 'bg-primary' : 'bg-gray-300'}`}
        activeOpacity={0.7}
      >
        <Text className="text-sm font-bold text-white">↑</Text>
      </TouchableOpacity>
    </View>
  );
};
