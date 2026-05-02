import { useState } from 'react';

import { useLocationPermission } from '@customer/maps/hooks/useLocationPermission';
import type { ChatMessage } from '@features/customer/chatbot/types/chatbot';
import { axiosApi } from '@lib/api/apiInstance';
import type { PickedImage } from '@utils/imagePicker';

type UseChatbotReturn = {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string, image?: PickedImage | null) => Promise<void>;
};

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { coords } = useLocationPermission();

  const sendMessage = async (
    text: string,
    image?: PickedImage | null
  ): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed && !image) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: trimmed,
      imageUri: image?.uri,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axiosApi.chatApi.sendMessage(
        trimmed,
        coords?.latitude ?? null,
        coords?.longitude ?? null,
        20,
        image
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
