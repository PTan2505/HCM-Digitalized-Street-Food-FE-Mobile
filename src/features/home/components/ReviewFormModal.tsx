import type { Dish } from '@features/home/types/branch';
import type {
  Feedback,
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
} from '@features/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import {
  compressImageForUpload,
  pickImagesFromLibrary,
  takePhotoWithCamera,
} from '@utils/imagePicker';
import type { PickedImage } from '@utils/imagePicker';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_COMMENT_LENGTH = 500;
const MAX_IMAGES = 5;

interface KeptImage {
  id: number;
  url: string;
}

interface ReviewFormModalProps {
  visible: boolean;
  branchId: number;
  dishes: Dish[];
  /** Pass to open in edit mode */
  existingFeedback?: Feedback;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewFormModal = ({
  visible,
  branchId,
  dishes,
  existingFeedback,
  onClose,
  onSuccess,
}: ReviewFormModalProps): JSX.Element => {
  const isEditMode = existingFeedback != null;

  const [rating, setRating] = useState(existingFeedback?.rating ?? 0);
  const [comment, setComment] = useState(existingFeedback?.comment ?? '');
  const [selectedDishId, setSelectedDishId] = useState<number | null>(
    existingFeedback?.dishId ?? null
  );
  /** New images picked/taken (not yet uploaded) */
  const [newImages, setNewImages] = useState<PickedImage[]>([]);
  /** Existing images kept in edit mode; removed ones will be deleted via API */
  const [keptImages, setKeptImages] = useState<KeptImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync fields when the modal opens or switches between write/edit mode
  useEffect(() => {
    if (visible) {
      setRating(existingFeedback?.rating ?? 0);
      setComment(existingFeedback?.comment ?? '');
      setSelectedDishId(existingFeedback?.dishId ?? null);
      setKeptImages(
        existingFeedback?.images?.map((img) => ({
          id: img.id,
          url: img.url,
        })) ?? []
      );
      setNewImages([]);
      setSubmitError(null);
    }
  }, [visible, existingFeedback]);

  const reset = (): void => {
    setRating(0);
    setComment('');
    setSelectedDishId(null);
    setNewImages([]);
    setKeptImages([]);
    setSubmitError(null);
  };

  const handleClose = (): void => {
    if (!isEditMode) reset();
    onClose();
  };

  const addImages = (picked: PickedImage[]): void => {
    setNewImages((prev) =>
      [...prev, ...picked].slice(0, MAX_IMAGES - keptImages.length)
    );
  };

  const handleAddImage = (): void => {
    const remaining = MAX_IMAGES - keptImages.length - newImages.length;
    if (remaining <= 0) return;

    Alert.alert('Thêm ảnh', undefined, [
      {
        text: 'Chụp ảnh',
        onPress: (): void => {
          void takePhotoWithCamera().then((result) => {
            if (result.error === 'permission_denied') {
              setSubmitError('Cần quyền truy cập camera để chụp ảnh.');
            } else if (result.images.length > 0) {
              addImages(result.images);
            }
          });
        },
      },
      {
        text: 'Chọn từ thư viện',
        onPress: (): void => {
          void pickImagesFromLibrary({ maxImages: remaining }).then(
            (result) => {
              if (result.error === 'permission_denied') {
                setSubmitError('Cần quyền truy cập thư viện ảnh để chọn ảnh.');
              } else if (result.images.length > 0) {
                addImages(result.images);
              }
            }
          );
        },
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const uploadImages = async (feedbackId: number): Promise<void> => {
    if (newImages.length === 0) return;
    const compressed = await Promise.all(
      newImages.map((img) => compressImageForUpload(img.uri, img.fileName))
    );
    const formData = new FormData();
    compressed.forEach((img) => {
      formData.append('images', {
        uri: img.uri,
        type: img.mimeType,
        name: img.fileName,
      } as unknown as Blob);
    });
    await axiosApi.feedbackApi.uploadFeedbackImages(feedbackId, formData);
  };

  const deleteRemovedImages = async (feedbackId: number): Promise<void> => {
    const originalImages =
      existingFeedback?.images?.map((img) => ({ id: img.id })) ?? [];
    const keptIds = new Set(keptImages.map((img) => img.id));
    const removed = originalImages.filter((img) => !keptIds.has(img.id));
    await Promise.all(
      removed.map(
        (img): Promise<void> =>
          axiosApi.feedbackApi.deleteFeedbackImage(feedbackId, img.id)
      )
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (rating === 0) {
      setSubmitError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let feedbackId: number;

      if (isEditMode) {
        const payload: UpdateFeedbackRequest = {
          dishId: selectedDishId ?? undefined,
          rating,
          comment: comment.trim() || undefined,
        };
        const updated = await axiosApi.feedbackApi.updateFeedback(
          existingFeedback.id,
          payload
        );
        feedbackId = updated.id;
        await deleteRemovedImages(feedbackId);
      } else {
        const payload: SubmitFeedbackRequest = {
          branchId,
          dishId: selectedDishId,
          orderId: null,
          rating,
          comment: comment.trim() || null,
          tagIds: [],
        };
        const created = await axiosApi.feedbackApi.submitFeedback(payload);
        feedbackId = created.id;
      }

      await uploadImages(feedbackId);

      if (!isEditMode) reset();
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr?.status === 400) {
        setSubmitError(
          apiErr.message ??
            'Không thể gửi đánh giá. Bạn có thể không ở gần quán.'
        );
      } else if (apiErr?.status === 429) {
        setSubmitError('Bạn đã đánh giá đủ số lần cho phép hôm nay.');
      } else {
        setSubmitError('Gửi đánh giá thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImageCount = keptImages.length + newImages.length;
  const canAddMore = totalImageCount < MAX_IMAGES;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-gray-900">
            {isEditMode ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Star rating */}
          <View className="mb-6 mt-5 items-center">
            <Text className="mb-3 text-sm font-medium text-gray-700">
              Đánh giá của bạn *
            </Text>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  hitSlop={4}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dish selector */}
          {dishes.length > 0 && (
            <View className="mb-5">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Món ăn (tuỳ chọn)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-1"
              >
                {dishes.map((dish) => {
                  const isSelected = selectedDishId === dish.dishId;
                  return (
                    <TouchableOpacity
                      key={dish.dishId}
                      onPress={() =>
                        setSelectedDishId(isSelected ? null : dish.dishId)
                      }
                      className={`mx-1 rounded-full border px-3 py-1.5 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}
                      >
                        {dish.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Comment */}
          <View className="mb-5">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Nhận xét (tuỳ chọn)
            </Text>
            <TextInput
              value={comment}
              onChangeText={(text) => {
                if (text.length <= MAX_COMMENT_LENGTH) setComment(text);
              }}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="rounded-xl border border-gray-200 p-3 text-sm text-gray-900"
              style={{ minHeight: 100 }}
            />
            <Text className="mt-1 text-right text-xs text-gray-400">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </Text>
          </View>

          {/* Images */}
          <View className="mb-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-700">
                Hình ảnh (tuỳ chọn)
              </Text>
              <Text className="text-xs text-gray-400">
                {totalImageCount}/{MAX_IMAGES}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {/* Existing images (edit mode) */}
              {keptImages.map((img) => (
                <View key={img.id} className="relative">
                  <Image
                    source={{ uri: img.url }}
                    className="h-20 w-20 rounded-xl"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setKeptImages((prev) =>
                        prev.filter((i) => i.id !== img.id)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5"
                    hitSlop={4}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Newly picked/taken images */}
              {newImages.map((img, i) => (
                <View key={img.uri} className="relative">
                  <Image
                    source={{ uri: img.uri }}
                    className="h-20 w-20 rounded-xl"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setNewImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5"
                    hitSlop={4}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add button */}
              {canAddMore && (
                <TouchableOpacity
                  onPress={handleAddImage}
                  className="h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50"
                >
                  <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                  <Text className="mt-1 text-[10px] text-gray-400">
                    Thêm ảnh
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error message */}
          {submitError && (
            <View className="mb-4 rounded-lg bg-red-50 px-3 py-2">
              <Text className="text-sm text-red-600">{submitError}</Text>
            </View>
          )}
        </ScrollView>

        {/* Submit button */}
        <View className="border-t border-gray-100 px-4 py-3">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className={`items-center rounded-xl py-3.5 ${
              isSubmitting || rating === 0 ? 'bg-gray-200' : 'bg-primary'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                className={`text-sm font-semibold ${rating === 0 ? 'text-gray-400' : 'text-white'}`}
              >
                {isEditMode ? 'Lưu thay đổi' : 'Gửi đánh giá'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
