import { Ionicons } from '@expo/vector-icons';
import type {
  Feedback,
  FeedbackTag,
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
} from '@features/customer/home/types/feedback';
import { axiosApi } from '@lib/api/apiInstance';
import type { PickedImage } from '@utils/imagePicker';
import {
  compressImageForUpload,
  pickImagesFromLibrary,
  takePhotoWithCamera,
} from '@utils/imagePicker';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
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
  /** Pass to open in edit mode */
  existingFeedback?: Feedback;
  /**
   * When provided the review is linked to a completed order.
   * Order-based reviews bypass velocity/distance restrictions.
   */
  orderId?: number | null;
  /** Required in the submit payload for non-order reviews */
  userLat?: number | null;
  userLong?: number | null;
  onClose: () => void;
  onSuccess: (feedback: Feedback, isEdit: boolean) => void;
}

export const ReviewFormModal = ({
  visible,
  branchId,
  existingFeedback,
  orderId,
  userLat,
  userLong,
  onClose,
  onSuccess,
}: ReviewFormModalProps): JSX.Element => {
  const isEditMode = existingFeedback != null;
  const isOrderMode = !isEditMode && orderId != null;
  const { t } = useTranslation();

  const [rating, setRating] = useState(existingFeedback?.rating ?? 0);
  const [comment, setComment] = useState(existingFeedback?.comment ?? '');
  /** New images picked/taken (not yet uploaded) */
  const [newImages, setNewImages] = useState<PickedImage[]>([]);
  /** Existing images kept in edit mode; removed ones will be deleted via API */
  const [keptImages, setKeptImages] = useState<KeptImage[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    existingFeedback?.tags?.map((tag) => tag.id) ?? []
  );
  const [availableTags, setAvailableTags] = useState<FeedbackTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  const [canSubmitReview, setCanSubmitReview] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const [commentSectionY, setCommentSectionY] = useState(0);

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
      setSelectedTagIds(existingFeedback?.tags?.map((tag) => tag.id) ?? []);
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
        if (orderId != null) {
          // Order-based review: no velocity check needed
          setCanSubmitReview(true);
        } else if (userLat != null && userLong != null) {
          // Non-order review: verify eligibility with branch-specific check
          setIsCheckingLimit(true);
          setCanSubmitReview(true);
          axiosApi.feedbackApi
            .checkVelocity({ branchId, userLat, userLong })
            .then((velocityData) => {
              if (velocityData.canReviewWithoutOrder === false) {
                setCanSubmitReview(false);
                setSubmitError(t('review.form.error_daily_limit'));
              }
            })
            .catch(() => {
              setCanSubmitReview(true);
            })
            .finally(() => setIsCheckingLimit(false));
        } else {
          // No location — block non-order submission
          setCanSubmitReview(false);
          setSubmitError(t('review.form.error_location_required'));
        }
      }
    }
  }, [
    visible,
    existingFeedback,
    isEditMode,
    orderId,
    branchId,
    userLat,
    userLong,
    t,
  ]);

  const reset = (): void => {
    setRating(0);
    setComment('');
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

    Alert.alert(t('review.form.add_image_title'), undefined, [
      {
        text: t('review.form.add_image_take_photo'),
        onPress: (): void => {
          void takePhotoWithCamera().then((result) => {
            if (result.error === 'permission_denied') {
              setSubmitError(t('review.form.camera_permission_required'));
            } else if (result.images.length > 0) {
              addImages(result.images);
            }
          });
        },
      },
      {
        text: t('review.form.add_image_from_library'),
        onPress: (): void => {
          void pickImagesFromLibrary({ maxImages: remaining }).then(
            (result) => {
              if (result.error === 'permission_denied') {
                setSubmitError(t('review.form.library_permission_required'));
              } else if (result.images.length > 0) {
                addImages(result.images);
              }
            }
          );
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
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
      setSubmitError(t('review.form.error_select_rating'));
      return;
    }

    if (!isEditMode && !canSubmitReview) {
      setSubmitError(t('review.form.error_daily_limit'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let feedback: Feedback;

      if (isEditMode) {
        const payload: UpdateFeedbackRequest = {
          rating,
          comment: comment.trim() || undefined,
          tagIds: selectedTagIds,
        };
        feedback = await axiosApi.feedbackApi.updateFeedback(
          existingFeedback.id,
          payload
        );
        await deleteRemovedImages(feedback.id);
      } else if (isOrderMode) {
        // Order-based review: link to order, no location required
        const payload: SubmitFeedbackRequest = {
          branchId,
          dishId: null,
          orderId: orderId,
          rating,
          comment: comment.trim() || null,
          tagIds: selectedTagIds,
        };
        feedback = await axiosApi.feedbackApi.submitFeedback(payload);
      } else {
        // Non-order review: include user coordinates
        const payload: SubmitFeedbackRequest = {
          branchId,
          dishId: null,
          orderId: null,
          rating,
          comment: comment.trim() || null,
          tagIds: selectedTagIds,
          userLat: userLat ?? null,
          userLong: userLong ?? null,
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
          apiErr.message ?? t('review.form.error_submit_not_near')
        );
      } else if (apiErr?.status === 429) {
        setSubmitError(t('review.form.error_daily_limit'));
        setCanSubmitReview(false);
      } else {
        setSubmitError(t('review.form.error_submit_default'));
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
            {isEditMode
              ? t('review.form.title_edit')
              : t('review.form.title_write')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          enabled={Platform.OS === 'android'}
        >
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentContainerStyle={
              Platform.OS === 'ios' ? { paddingBottom: 32 } : undefined
            }
          >
            {isEditMode && (
              <View className="mb-4 mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <Text className="text-sm text-amber-700">
                  {t('review.form.edit_notice')}
                </Text>
              </View>
            )}

            {isOrderMode && (
              <View className="mb-4 mt-5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
                <Text className="text-sm text-blue-700">
                  {t('review.form.order_review_notice')}
                </Text>
              </View>
            )}

            {/* Star rating */}
            <View className={`mb-6 items-center ${isEditMode ? '' : 'mt-5'}`}>
              <Text className="mb-3 text-base font-medium text-gray-700">
                {t('review.form.your_rating')}
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

            {/* Tags */}
            {availableTags.length > 0 && (
              <View className="mb-5">
                <Text className="mb-3 text-base font-medium text-gray-700">
                  {t('review.form.tags_optional')}
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
              onLayout={(e) => setCommentSectionY(e.nativeEvent.layout.y)}
            >
              <Text className="mb-2 text-base font-medium text-gray-700">
                {t('review.form.comment')}
              </Text>
              <TextInput
                value={comment}
                onChangeText={(text) => {
                  if (text.length <= MAX_COMMENT_LENGTH) setComment(text);
                }}
                placeholder={t('review.form.comment_placeholder')}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={() => {
                  if (Platform.OS === 'ios') {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: commentSectionY - 16,
                        animated: true,
                      });
                    }, 5);
                  }
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
                  {t('review.form.images_optional')}
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
                        setNewImages((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
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
                      {t('review.form.add_image')}
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
                  {isEditMode
                    ? t('review.form.save_changes')
                    : t('review.form.submit')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
