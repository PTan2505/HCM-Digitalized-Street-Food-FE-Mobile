import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@components/Header';
import { useNavigation } from '@react-navigation/native';

import { ChatInput } from '@features/customer/chatbot/components/ChatInput';
import { ChatMessageList } from '@features/customer/chatbot/components/ChatMessageList';
import { useChatbot } from '@features/customer/chatbot/hooks/useChatbot';

export const ChatbotScreen = (): React.JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage } = useChatbot();

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['left', 'right', 'bottom']}
    >
      <Header
        title={t('chatbot.title')}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <View className="flex-1">
          <ChatMessageList
            messages={messages}
            isLoading={isLoading}
            onSuggestionPress={sendMessage}
          />
        </View>
        <View className="px-4 pb-4 pt-2">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
