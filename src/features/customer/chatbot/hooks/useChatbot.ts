import { useState } from 'react';

import type { ChatMessage } from '@features/customer/chatbot/types/chatbot';
import { axiosApi } from '@lib/api/apiInstance';

type UseChatbotReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
};

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axiosApi.chatApi.sendMessage(
        trimmed
        // coords?.latitude ?? null,
        // coords?.longitude ?? null,
        // 100
      );
      const data = response.data;

      const botMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'bot',
        text: data.reply,
        recommendedBranches:
          data.recommendedBranches?.length > 0
            ? data.recommendedBranches
            : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'bot',
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
};
