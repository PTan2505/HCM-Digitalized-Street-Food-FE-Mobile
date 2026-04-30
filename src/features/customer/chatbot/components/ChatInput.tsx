import { Camera, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { PickedImage } from '@utils/imagePicker';
import { pickImagesFromLibrary, takePhotoWithCamera } from '@utils/imagePicker';

type Props = {
  onSend: (text: string, image?: PickedImage | null) => void;
  isLoading: boolean;
};

export const ChatInput = ({ onSend, isLoading }: Props): React.JSX.Element => {
  const [text, setText] = useState('');
  const [pendingImage, setPendingImage] = useState<PickedImage | null>(null);

  const handleSend = (): void => {
    if ((!text.trim() && !pendingImage) || isLoading) return;
    onSend(text, pendingImage);
    setText('');
    setPendingImage(null);
  };

  const openImagePicker = (): void => {
    Alert.alert('Đính kèm ảnh', undefined, [
      {
        text: 'Chụp ảnh',
        onPress: async (): Promise<void> => {
          const result = await takePhotoWithCamera();
          if (result.images[0]) setPendingImage(result.images[0]);
        },
      },
      {
        text: 'Chọn từ thư viện',
        onPress: async (): Promise<void> => {
          const result = await pickImagesFromLibrary();
          if (result.images[0]) setPendingImage(result.images[0]);
        },
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const canSend = !isLoading && text.trim().length > 0;

  return (
    <View className="rounded-3xl border border-gray-200 bg-white px-4 py-3">
      {pendingImage && (
        <View className="mb-2 w-20">
          <Image
            source={{ uri: pendingImage.uri }}
            className="h-20 w-20 rounded-xl"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setPendingImage(null)}
            className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-gray-700"
          >
            <X size={12} color="white" />
          </TouchableOpacity>
        </View>
      )}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={openImagePicker}
          disabled={isLoading}
          className="mr-2 h-8 w-8 items-center justify-center"
          activeOpacity={0.7}
        >
          <Camera size={22} color={isLoading ? '#d1d5db' : '#6b7280'} />
        </TouchableOpacity>
        <TextInput
          className="flex-1 text-gray-900"
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#72796d"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={true}
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
    </View>
  );
};
