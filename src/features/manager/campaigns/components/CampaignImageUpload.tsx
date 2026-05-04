import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface CampaignImageValue {
  uri: string;
  mimeType: string;
  fileName: string;
  isExisting: boolean;
}

interface Props {
  value: CampaignImageValue | null;
  onChange: (next: CampaignImageValue | null) => void;
  initialUrl?: string | null;
}

export const CampaignImageUpload = ({
  value,
  onChange,
  initialUrl,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [isPicking, setIsPicking] = useState(false);

  const previewUri = value?.uri ?? (initialUrl && !value ? initialUrl : null);

  const ensurePermission = async (
    type: 'camera' | 'library'
  ): Promise<boolean> => {
    const { status } =
      type === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        t(
          type === 'camera'
            ? 'edit_profile.camera_permission_denied_title'
            : 'edit_profile.gallery_permission_denied_title'
        ),
        t(
          type === 'camera'
            ? 'edit_profile.camera_permission_denied_message'
            : 'edit_profile.gallery_permission_denied_message'
        )
      );
      return false;
    }
    return true;
  };

  const launch = async (source: 'camera' | 'library'): Promise<void> => {
    const ok = await ensurePermission(source);
    if (!ok) return;
    setIsPicking(true);
    try {
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onChange({
          uri: asset.uri,
          mimeType: asset.mimeType ?? 'image/jpeg',
          fileName: asset.fileName ?? `campaign_${Date.now()}.jpg`,
          isExisting: false,
        });
      }
    } finally {
      setIsPicking(false);
    }
  };

  const pick = (): void => {
    Alert.alert(
      t('manager_campaigns.choose_image_title'),
      t('edit_profile.choose_source'),
      [
        {
          text: t('edit_profile.take_photo'),
          onPress: (): void => {
            void launch('camera');
          },
        },
        {
          text: t('edit_profile.choose_from_gallery'),
          onPress: (): void => {
            void launch('library');
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const clear = (): void => {
    onChange(null);
  };

  return (
    <View className="gap-1">
      <Text className="text-lg font-semibold text-[#616161]">
        {t('manager_campaigns.field_image')}
      </Text>

      {previewUri ? (
        <View className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          <Image
            source={{ uri: previewUri }}
            style={{ width: '100%', aspectRatio: 16 / 9 }}
            resizeMode="cover"
          />
          <View className="flex-row gap-2 p-2">
            <TouchableOpacity
              onPress={pick}
              className="flex-1 items-center rounded-full bg-gray-100 py-2"
              disabled={isPicking}
            >
              {isPicking ? (
                <ActivityIndicator color="#9FD356" />
              ) : (
                <Text className="text-sm font-semibold text-gray-700">
                  {t('manager_campaigns.replace_image')}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={clear}
              className="items-center rounded-full bg-red-50 px-4 py-2"
              disabled={isPicking}
            >
              <Text className="text-sm font-semibold text-red-500">
                {t('common.remove')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={pick}
          disabled={isPicking}
          className="items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-8"
        >
          {isPicking ? (
            <ActivityIndicator color="#9FD356" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="image-plus"
                size={32}
                color="#9FD356"
              />
              <Text className="mt-2 text-sm font-semibold text-gray-600">
                {t('manager_campaigns.upload_image')}
              </Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
};
