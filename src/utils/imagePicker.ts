import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { PermissionStatus } from 'expo-image-picker';

export interface PickedImage {
  uri: string;
  mimeType: string;
  fileName: string;
}

export type ImagePickerError = 'permission_denied' | 'cancelled';

export interface ImagePickerResult {
  images: PickedImage[];
  error?: ImagePickerError;
}

export interface PickFromLibraryOptions {
  /** Max number of images to select (default 1) */
  maxImages?: number;
  quality?: number;
}

export interface TakePhotoOptions {
  quality?: number;
}

/**
 * Resize + re-compress a picked image before upload.
 * - Max dimension: 1080 px on the longest side
 * - JPEG quality: 0.6
 *
 * This keeps file sizes well under typical server limits while
 * still producing visually acceptable thumbnails / review photos.
 */
export async function compressImageForUpload(
  uri: string,
  fileName: string
): Promise<PickedImage> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );
  return {
    uri: result.uri,
    mimeType: 'image/jpeg',
    fileName: fileName.replace(/\.[^.]+$/, '.jpg'),
  };
}

/**
 * Request permission + launch the media library picker.
 * Returns up to `maxImages` picked images, or an error reason.
 */
export async function pickImagesFromLibrary(
  options: PickFromLibraryOptions = {}
): Promise<ImagePickerResult> {
  const { maxImages = 1, quality = 1 } = options;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== PermissionStatus.GRANTED) {
    return { images: [], error: 'permission_denied' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: maxImages > 1,
    selectionLimit: maxImages,
    quality,
  });

  if (result.canceled) {
    return { images: [], error: 'cancelled' };
  }

  return {
    images: result.assets.map((asset, i) => ({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? `image_${Date.now()}_${i}.jpg`,
    })),
  };
}

/**
 * Request permission + launch the camera to take a single photo.
 * Returns the captured image, or an error reason.
 */
export async function takePhotoWithCamera(
  options: TakePhotoOptions = {}
): Promise<ImagePickerResult> {
  const { quality = 1 } = options;

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== PermissionStatus.GRANTED) {
    return { images: [], error: 'permission_denied' };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality,
  });

  if (result.canceled) {
    return { images: [], error: 'cancelled' };
  }

  const asset = result.assets[0];
  return {
    images: [
      {
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
      },
    ],
  };
}
