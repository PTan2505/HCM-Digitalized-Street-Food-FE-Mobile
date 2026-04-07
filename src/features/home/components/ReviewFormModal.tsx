import { Ionicons } from '@expo/vector-icons';
import type { Dish } from '@features/home/types/branch';
import type {
  Feedback,
  FeedbackTag,
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
} from '@features/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import type { PickedImage } from '@utils/imagePicker';
import {
  compressImageForUpload,
  pickImagesFromLibrary,
  takePhotoWithCamera,
} from '@utils/imagePicker';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  onSuccess: (feedback: Feedback, isEdit: boolean) => void;
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
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    existingFeedback?.tags?.map((t) => t.id) ?? []
  );
  const [availableTags, setAvailableTags] = useState<FeedbackTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [canSubmitReview, setCanSubmitReview] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const [commentY, setCommentY] = useState(0);

  // Fetch available tags once
  useEffect(() => {
    axiosApi.feedbackTagApi
      .getTags()
      .then(setAvailableTags)
      .catch(() => {});
  }, []);

  // Sync fields when the modal opens or switches between write/edit mode
  useEffect(() => {
    if (visible) {
      setRating(existingFeedback?.rating ?? 0);
      setComment(existingFeedback?.comment ?? '');
      setSelectedDishId(existingFeedback?.dishId ?? null);
      setSelectedTagIds(existingFeedback?.tags?.map((t) => t.id) ?? []);
      setKeptImages(
        existingFeedback?.images?.map((img) => ({
          id: img.id,
          url: img.url,
        })) ?? []
      );
      setNewImages([]);
      setSubmitError(null);

      // Check if user can submit a new review (only in write mode)
      if (!isEditMode) {
        setIsCheckingLimit(true);
        setCanSubmitReview(true);
        axiosApi.feedbackApi
          .checkVelocity()
          .then((velocityData) => {
            if (velocityData.remainingTotalToday === 0) {
              setCanSubmitReview(false);
              setSubmitError('Bạn đã đánh giá đủ số lần cho phép hôm nay.');
            }
          })
          .catch(() => {
            // On error, allow submission (fail open)
            setCanSubmitReview(true);
          })
          .finally(() => setIsCheckingLimit(false));
      }
    }
  }, [visible, existingFeedback, isEditMode]);

  const reset = (): void => {
    setRating(0);
    setComment('');
    setSelectedDishId(null);
    setSelectedTagIds([]);
    setNewImages([]);
    setKeptImages([]);
    setSubmitError(null);
    setIsCheckingLimit(false);
    setCanSubmitReview(true);
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

    // Check daily limit (only in write mode)
    if (!isEditMode && !canSubmitReview) {
      setSubmitError('Bạn đã đánh giá đủ số lần cho phép hôm nay.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let feedback: Feedback;

      if (isEditMode) {
        const payload: UpdateFeedbackRequest = {
          dishId: selectedDishId ?? undefined,
          rating,
          comment: comment.trim() || undefined,
          tagIds: selectedTagIds,
        };
        feedback = await axiosApi.feedbackApi.updateFeedback(
          existingFeedback.id,
          payload
        );
        await deleteRemovedImages(feedback.id);
      } else {
        const payload: SubmitFeedbackRequest = {
          branchId,
          dishId: selectedDishId,
          orderId: null,
          rating,
          comment: comment.trim() || null,
          tagIds: selectedTagIds,
        };
        feedback = await axiosApi.feedbackApi.submitFeedback(payload);
      }

      await uploadImages(feedback.id);

      // Fetch updated feedback with images after upload
      const updatedFeedback = await axiosApi.feedbackApi.getFeedback(
        feedback.id
      );

      if (!isEditMode) reset();
      onSuccess(updatedFeedback, isEditMode);
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr?.status === 400) {
        setSubmitError(
          apiErr.message ??
            'Không thể gửi đánh giá. Bạn có thể không ở gần quán.'
        );
      } else if (apiErr?.status === 429) {
        setSubmitError('Bạn đã đánh giá đủ số lần cho phép hôm nay.');
        setCanSubmitReview(false); // Prevent retry
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
          ref={scrollViewRef}
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          {/* Star rating */}
          <View className="mb-6 mt-5 items-center">
            <Text className="mb-3 text-base font-medium text-gray-700">
              Đánh giá của bạn
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
              <Text className="mb-3 text-base font-medium text-gray-700">
                Món ăn (Tuỳ chọn)
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
                      className={`mx-1 w-40 overflow-hidden rounded-2xl border ${
                        isSelected
                          ? 'border-primary bg-primary-light/20'
                          : 'border-gray-200 bg-white'
                      }`}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 3,
                        elevation: 2,
                      }}
                      disabled={dish.isSoldOut}
                    >
                      {/* Dish Image */}
                      {dish.imageUrl ? (
                        <View className="relative">
                          <Image
                            source={{ uri: dish.imageUrl }}
                            className="h-24 w-full"
                            resizeMode="cover"
                          />
                          {dish.isSoldOut && (
                            <View className="absolute inset-0 items-center justify-center bg-black/50">
                              <Text className="text-sm font-semibold text-white">
                                HẾT HÀNG
                              </Text>
                            </View>
                          )}
                          {isSelected && (
                            <View className="absolute right-2 top-2 rounded-full bg-primary p-1">
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#fff"
                              />
                            </View>
                          )}
                        </View>
                      ) : (
                        <View
                          className={`h-24 w-full items-center justify-center ${
                            dish.isSoldOut ? 'bg-gray-200' : 'bg-gray-100'
                          }`}
                        >
                          <Ionicons
                            name="restaurant-outline"
                            size={32}
                            color={dish.isSoldOut ? '#9CA3AF' : '#D1D5DB'}
                          />
                          {dish.isSoldOut && (
                            <Text className="mt-1 text-sm font-semibold text-gray-500">
                              HẾT HÀNG
                            </Text>
                          )}
                          {isSelected && !dish.isSoldOut && (
                            <View className="absolute right-2 top-2 rounded-full bg-primary p-1">
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#fff"
                              />
                            </View>
                          )}
                        </View>
                      )}

                      {/* Dish Details */}
                      <View className="p-3">
                        <Text
                          className={`mb-1 text-base font-semibold ${
                            dish.isSoldOut
                              ? 'text-gray-400'
                              : isSelected
                                ? 'text-primary-dark'
                                : 'text-gray-900'
                          }`}
                          numberOfLines={1}
                        >
                          {dish.name}
                        </Text>

                        <Text
                          className={`mb-2 text-sm font-medium ${
                            dish.isSoldOut ? 'text-gray-400' : 'text-primary'
                          }`}
                        >
                          {dish.price.toLocaleString('vi-VN')}đ
                        </Text>

                        {dish.description && (
                          <Text
                            className={`mb-2 text-sm ${
                              dish.isSoldOut ? 'text-gray-400' : 'text-gray-600'
                            }`}
                            numberOfLines={2}
                          >
                            {dish.description}
                          </Text>
                        )}

                        {/* Taste Tags */}
                        {dish.tasteNames.length > 0 && (
                          <View className="flex-row flex-wrap gap-1">
                            {dish.tasteNames.slice(0, 2).map((taste, idx) => (
                              <View
                                key={idx}
                                className={`rounded-full px-2 py-0.5 ${
                                  dish.isSoldOut
                                    ? 'bg-gray-100'
                                    : isSelected
                                      ? 'bg-primary/20'
                                      : 'bg-gray-100'
                                }`}
                              >
                                <Text
                                  className={`text-[10px] ${
                                    dish.isSoldOut
                                      ? 'text-gray-400'
                                      : isSelected
                                        ? 'text-primary-dark'
                                        : 'text-gray-600'
                                  }`}
                                >
                                  {taste}
                                </Text>
                              </View>
                            ))}
                            {dish.tasteNames.length > 2 && (
                              <View
                                className={`rounded-full px-2 py-0.5 ${
                                  dish.isSoldOut
                                    ? 'bg-gray-100'
                                    : isSelected
                                      ? 'bg-primary/20'
                                      : 'bg-gray-100'
                                }`}
                              >
                                <Text
                                  className={`text-[10px] ${
                                    dish.isSoldOut
                                      ? 'text-gray-400'
                                      : isSelected
                                        ? 'text-primary-dark'
                                        : 'text-gray-600'
                                  }`}
                                >
                                  +{dish.tasteNames.length - 2}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <View className="mb-5">
              <Text className="mb-3 text-base font-medium text-gray-700">
                Nhãn (Tuỳ chọn)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() =>
                        setSelectedTagIds((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Comment */}
          <View
            className="mb-5"
            onLayout={(e) => setCommentY(e.nativeEvent.layout.y)}
          >
            <Text className="mb-2 text-base font-medium text-gray-700">
              Nhận xét
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
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: commentY - 16,
                    animated: true,
                  });
                }, 100);
              }}
              className="rounded-xl border border-gray-200 p-3 text-base text-gray-900"
              style={{ minHeight: 100 }}
            />
            <Text className="mt-1 text-right text-sm text-gray-400">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </Text>
          </View>

          {/* Images */}
          <View className="mb-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-medium text-gray-700">
                Hình ảnh (Tuỳ chọn)
              </Text>
              <Text className="text-sm text-gray-400">
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
              <Text className="text-base text-red-600">{submitError}</Text>
            </View>
          )}
        </ScrollView>

        {/* Submit button */}
        <View className="border-t border-gray-100 px-4 py-3">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={
              isSubmitting ||
              isCheckingLimit ||
              rating === 0 ||
              (!isEditMode && !canSubmitReview)
            }
            className={`items-center rounded-xl py-3.5 ${
              isSubmitting ||
              isCheckingLimit ||
              rating === 0 ||
              (!isEditMode && !canSubmitReview)
                ? 'bg-gray-200'
                : 'bg-primary'
            }`}
          >
            {isSubmitting || isCheckingLimit ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  rating === 0 || (!isEditMode && !canSubmitReview)
                    ? 'text-gray-400'
                    : 'text-white'
                }`}
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
