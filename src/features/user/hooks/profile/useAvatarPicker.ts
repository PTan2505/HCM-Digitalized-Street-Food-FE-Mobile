import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const useAvatarPicker = (): {
  avatarUri: string | null;
  pickAvatar: () => void;
} => {
  const { t } = useTranslation();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const openCamera = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        t('edit_profile.camera_permission_denied_title'),
        t('edit_profile.camera_permission_denied_message')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }, [t]);

  const openGallery = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        t('edit_profile.gallery_permission_denied_title'),
        t('edit_profile.gallery_permission_denied_message')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }, [t]);

  const pickAvatar = useCallback((): void => {
    Alert.alert(
      t('edit_profile.change_avatar'),
      t('edit_profile.choose_source'),
      [
        { text: t('edit_profile.take_photo'), onPress: openCamera },
        { text: t('edit_profile.choose_from_gallery'), onPress: openGallery },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  }, [t, openCamera, openGallery]);

  return { avatarUri, pickAvatar };
};
