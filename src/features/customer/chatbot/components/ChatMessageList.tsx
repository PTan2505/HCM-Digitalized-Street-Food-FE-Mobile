import React, { useEffect, useRef } from 'react';
import { FlatList, View } from 'react-native';

import { BranchRecommendationList } from '@features/customer/chatbot/components/BranchRecommendationList';
import { ChatBubble } from '@features/customer/chatbot/components/ChatBubble';
import { EmptyMessageList } from '@features/customer/chatbot/components/EmptyMessageList';
import { TypingIndicator } from '@features/customer/chatbot/components/TypingIndicator';
import type { ChatMessage } from '@features/customer/chatbot/types/chatbot';

type Props = {
  messages: ChatMessage[];
  isLoading: boolean;
  onSuggestionPress: (text: string) => void;
};

export const ChatMessageList = ({
  messages,
  isLoading,
  onSuggestionPress,
}: Props): React.JSX.Element => {
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, isLoading]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <EmptyMessageList onSuggestionPress={onSuggestionPress} />
      }
      contentContainerStyle={{ padding: 16, gap: 12 }}
      onContentSizeChange={() =>
        listRef.current?.scrollToEnd({ animated: true })
      }
      ListFooterComponent={isLoading ? <TypingIndicator /> : null}
      renderItem={({ item }) => (
        <View className="gap-2">
          <ChatBubble
            role={item.role}
            text={item.text}
            imageUri={item.imageUri}
          />
          {item.role === 'bot' &&
            item.recommendedBranches &&
            item.recommendedBranches.length > 0 && (
              <BranchRecommendationList branches={item.recommendedBranches} />
            )}
        </View>
      )}
    />
  );
};
