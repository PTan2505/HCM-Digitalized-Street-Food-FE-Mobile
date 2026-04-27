import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@hooks/reduxHooks';
import { uploadAvatar } from '@slices/auth';

export const useAvatarPicker = (): {
  avatarUri: string | null;
  isUploading: boolean;
  pickAvatar: () => void;
} => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(
    async (asset: ImagePicker.ImagePickerAsset): Promise<void> => {
      setAvatarUri(asset.uri);
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: asset.uri,
          type: asset.mimeType ?? 'image/jpeg',
          name: asset.fileName ?? 'avatar.jpg',
        } as unknown as Blob);
        await dispatch(uploadAvatar(formData)).unwrap();
      } catch {
        Alert.alert(
          t('edit_profile.avatar_upload_failed_title', 'Lỗi'),
          t(
            'edit_profile.avatar_upload_failed_message',
            'Không thể tải ảnh lên. Vui lòng thử lại.'
          )
        );
        setAvatarUri(null);
      } finally {
        setIsUploading(false);
      }
    },
    [dispatch, t]
  );

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
      await uploadImage(result.assets[0]);
    }
  }, [t, uploadImage]);

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
      await uploadImage(result.assets[0]);
    }
  }, [t, uploadImage]);

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

  return { avatarUri, isUploading, pickAvatar };
};
