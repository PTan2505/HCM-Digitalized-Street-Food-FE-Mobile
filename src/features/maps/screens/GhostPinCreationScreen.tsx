import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import type { APIErrorResponse } from '@custom-types/apiResponse';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/home/types/branch';
import type { FeedbackTag } from '@features/home/types/feedback';
import type { PickedLocation } from '@features/maps/components/LocationPickerMap';
import { LocationPickerMap } from '@features/maps/components/LocationPickerMap';
import {
  getPlaceDetail,
  searchAddress,
  type AutocompletePrediction,
} from '@features/maps/services/geocoding';
import { axiosApi } from '@lib/api/apiInstance';
import { useNavigation } from '@react-navigation/native';
import {
  compressImageForUpload,
  pickImagesFromLibrary,
  takePhotoWithCamera,
  type PickedImage,
} from '@utils/imagePicker';
import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const GhostPinCreationScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [ward, setWard] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  // Images state
  const [selectedImages, setSelectedImages] = useState<PickedImage[]>([]);
  const MAX_IMAGES = 5;

  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [nearbyBranches, setNearbyBranches] = useState<ActiveBranch[]>([]);
  const [nearbyBranchImages, setNearbyBranchImages] = useState<
    Record<number, string>
  >({});
  const [rating, setRating] = useState(0);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<FeedbackTag[]>([]);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    axiosApi.feedbackTagApi
      .getTags()
      .then(setAvailableTags)
      .catch(() => {});
  }, []);

  // ── Address search ──
  const handleAddressSearch = useCallback((text: string) => {
    setAddressQuery(text);
    // Clear confirmed location when user types again
    setAddressDetail('');
    setWard('');
    setCity('');
    setLat(null);
    setLong(null);
    setNearbyBranches([]);
    setNearbyBranchImages({});

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!text.trim()) {
      setPredictions([]);
      return;
    }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchAddress(text);
      setPredictions(results);
      setIsSearching(false);
    }, 400);
  }, []);

  // ── Prediction select ──
  const handlePredictionSelect = useCallback(
    async (prediction: AutocompletePrediction): Promise<void> => {
      setPredictions([]);
      setAddressQuery(prediction.mainText);
      setIsGeocodingAddress(true);

      const detail = await getPlaceDetail(prediction.placeId);
      if (detail) {
        setAddressDetail(detail.addressDetail);
        setWard(detail.ward);
        setCity(detail.city);
        setLat(detail.lat);
        setLong(detail.lng);
        if (addressError) setAddressError(null);

        // Fetch nearby branches within 1km to warn about duplicates
        try {
          const branches = await axiosApi.stallSearchApi.getMapVendors(
            detail.lat,
            detail.lng,
            1
          );
          setNearbyBranches(branches);
          void fetchNearbyImages(branches);
        } catch {
          // silently ignore
        }
      }
      setIsGeocodingAddress(false);
    },
    [addressError]
  );

  // ── Fetch first image for each nearby branch in parallel ──
  const fetchNearbyImages = async (branches: ActiveBranch[]): Promise<void> => {
    const results = await Promise.allSettled(
      branches.map(async (b) => {
        const res = await axiosApi.branchApi.getBranchImages(b.branchId, 1, 1);
        return { branchId: b.branchId, imageUrl: res.items[0]?.imageUrl };
      })
    );
    const map: Record<number, string> = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.imageUrl) {
        map[r.value.branchId] = r.value.imageUrl;
      }
    });
    setNearbyBranchImages(map);
  };

  // ── Location picker confirm (map fallback) ──
  const handleLocationConfirm = useCallback(
    async (location: PickedLocation): Promise<void> => {
      const [lng, pickedLat] = location.coordinate;
      setLat(pickedLat);
      setLong(lng);
      setAddressQuery(
        `${location.addressDetail ?? location.address} ${location.ward ? ', ' + location.ward : ''} ${location.city ? ', ' + location.city : ''}`
      );
      setAddressDetail(location.addressDetail ?? location.address);
      setWard(location.ward ?? '');
      setCity(location.city ?? '');
      setPredictions([]);
      setShowLocationPicker(false);
      if (addressError) setAddressError(null);

      // Fetch nearby branches within 1km to warn about duplicates
      try {
        const branches = await axiosApi.stallSearchApi.getMapVendors(
          pickedLat,
          lng,
          1
        );
        setNearbyBranches(branches);
        void fetchNearbyImages(branches);
      } catch {
        // silently ignore — nearby search is non-critical
      }
    },
    [addressError]
  );

  // ── Image picker handlers ──
  const handlePickFromLibrary = async (): Promise<void> => {
    const remainingSlots = MAX_IMAGES - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert(
        t('ghost_pin_creation.alert.image_limit_title'),
        t('ghost_pin_creation.alert.image_limit_message', { count: MAX_IMAGES })
      );
      return;
    }

    const result = await pickImagesFromLibrary({
      maxImages: remainingSlots,
      quality: 0.8,
    });

    if (result.error === 'permission_denied') {
      Alert.alert(
        t('ghost_pin_creation.alert.permission_title'),
        t('ghost_pin_creation.alert.photo_permission_message')
      );
    } else if (result.images.length > 0) {
      setSelectedImages((prev) => [...prev, ...result.images]);
    }
  };

  const handleTakePhoto = async (): Promise<void> => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert(
        t('ghost_pin_creation.alert.image_limit_title'),
        t('ghost_pin_creation.alert.image_limit_message', { count: MAX_IMAGES })
      );
      return;
    }

    const result = await takePhotoWithCamera({ quality: 0.8 });

    if (result.error === 'permission_denied') {
      Alert.alert(
        t('ghost_pin_creation.alert.permission_title'),
        t('ghost_pin_creation.alert.camera_permission_message')
      );
    } else if (result.images.length > 0) {
      setSelectedImages((prev) => [...prev, ...result.images]);
    }
  };

  const handleRemoveImage = (index: number): void => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const showImagePickerOptions = (): void => {
    Alert.alert(
      t('ghost_pin_creation.alert.add_image_title'),
      t('ghost_pin_creation.alert.choose_image_source'),
      [
        {
          text: t('ghost_pin_creation.alert.take_photo'),
          onPress: handleTakePhoto,
        },
        {
          text: t('ghost_pin_creation.alert.choose_from_library'),
          onPress: handlePickFromLibrary,
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  // ── Validation ──
  const validate = (): boolean => {
    let valid = true;
    if (name.trim().length < 2) {
      setNameError(t('ghost_pin_creation.validation.name_min_length'));
      valid = false;
    } else {
      setNameError(null);
    }
    if (!addressDetail.trim() || lat == null || long == null) {
      setAddressError(t('ghost_pin_creation.validation.address_required'));
      valid = false;
    } else {
      setAddressError(null);
    }
    return valid;
  };

  // ── Submit ──
  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      // 1. Create ghost pin
      const response = await axiosApi.ghostPinApi.createGhostPin({
        name: name.trim(),
        addressDetail: addressDetail.trim(),
        ward: ward.trim() || null,
        city: city.trim(),
        lat: lat!,
        long: long!,
      });

      // 2. Submit feedback via feedbackApi if there's any feedback content
      const branchId = response.data.branchId;
      if (
        branchId != null &&
        branchId > 0 &&
        (rating > 0 ||
          feedback.trim() ||
          selectedImages.length > 0 ||
          selectedTagIds.length > 0)
      ) {
        try {
          const submittedFeedback = await axiosApi.feedbackApi.submitFeedback({
            branchId,
            dishId: null,
            orderId: null,
            rating: rating || 5,
            comment: feedback.trim() || null,
            tagIds: selectedTagIds,
          });

          // 3. Upload images to the submitted feedback
          if (selectedImages.length > 0) {
            const compressed = await Promise.all(
              selectedImages.map((img) =>
                compressImageForUpload(img.uri, img.fileName)
              )
            );
            const formData = new FormData();
            compressed.forEach((img) => {
              formData.append('images', {
                uri: img.uri,
                type: img.mimeType,
                name: img.fileName,
              } as unknown as Blob);
            });
            await axiosApi.feedbackApi.uploadFeedbackImages(
              submittedFeedback.id,
              formData
            );
          }
        } catch (feedbackError) {
          console.warn('Failed to submit feedback:', feedbackError);
          // Don't fail the entire creation if feedback submission fails
        }
      }

      Alert.alert(
        t('ghost_pin_creation.alert.success_title'),
        t('ghost_pin_creation.alert.success_message'),
        [{ text: t('common.ok'), onPress: (): void => navigation.goBack() }]
      );
    } catch (error: unknown) {
      const apiError = error as APIErrorResponse;
      if (apiError?.status === 409) {
        setSubmitError(t('ghost_pin_creation.submit_error.duplicate_nearby'));
      } else {
        setSubmitError(t('ghost_pin_creation.submit_error.default'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <Header
          title={t('ghost_pin_creation.title')}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Name (required) */}
          <View className="mb-5">
            <Text className="mb-1.5 text-base font-semibold text-gray-700">
              {t('ghost_pin_creation.form.name_label')}{' '}
              <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border px-4 py-3 text-gray-800 ${
                nameError ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder={t('ghost_pin_creation.form.name_placeholder')}
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
              }}
              maxLength={100}
              returnKeyType="next"
            />
            {nameError && (
              <Text className="mt-1 text-sm text-red-500">{nameError}</Text>
            )}
          </View>

          {/* Address search with autocomplete */}
          <View className="mb-5">
            <Text className="mb-1.5 text-base font-semibold text-gray-700">
              {t('ghost_pin_creation.form.address_label')}{' '}
              <Text className="text-red-500">*</Text>
            </Text>
            <View
              className={`flex-row items-center rounded-xl border px-3 py-3 ${
                addressError ? 'border-red-400' : 'border-gray-200'
              }`}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={lat != null ? COLORS.primary : '#9CA3AF'}
                style={{ marginRight: 8 }}
              />
              <TextInput
                className="flex-1 text-gray-800"
                placeholder={t('ghost_pin_creation.form.address_placeholder')}
                placeholderTextColor="#9CA3AF"
                value={addressQuery}
                onChangeText={handleAddressSearch}
                returnKeyType="search"
              />
              {isSearching || isGeocodingAddress ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <TouchableOpacity
                  onPress={() => setShowLocationPicker(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="map-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Autocomplete predictions */}
            {predictions.length > 0 && (
              <View className="mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                {predictions.map((prediction, index) => (
                  <TouchableOpacity
                    key={prediction.placeId}
                    onPress={() => handlePredictionSelect(prediction)}
                    className={`px-4 py-3 ${
                      index < predictions.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-base font-medium text-gray-800"
                      numberOfLines={1}
                    >
                      {prediction.mainText}
                    </Text>
                    {prediction.secondaryText ? (
                      <Text
                        className="mt-0.5 text-sm text-gray-400"
                        numberOfLines={1}
                      >
                        {prediction.secondaryText}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {addressError && (
              <Text className="mt-1 text-sm text-red-500">{addressError}</Text>
            )}
          </View>

          {/* Nearby branches warning */}
          {nearbyBranches.length > 0 && (
            <View className="mb-5 rounded-xl border border-orange-200 bg-orange-50 py-3">
              <View className="flex-row items-center px-4">
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color="#EA580C"
                  style={{ marginRight: 8 }}
                />
                <Text className="flex-1 text-base font-semibold text-orange-700">
                  {t('ghost_pin_creation.nearby.title')}
                </Text>
              </View>
              <Text className="mt-1 px-4 text-sm text-orange-600">
                {t('ghost_pin_creation.nearby.description', {
                  count: nearbyBranches.length,
                })}
              </Text>
              <FlatList
                data={nearbyBranches
                  .slice()
                  .sort(
                    (a, b) =>
                      (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
                  )
                  .slice(0, 5)}
                keyExtractor={(item) => String(item.branchId)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 10,
                  gap: 10,
                }}
                renderItem={({ item }) => {
                  const imageUrl = nearbyBranchImages[item.branchId];
                  const displayName = `${item.vendorName} - ${item.name}`;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="w-28 overflow-hidden rounded-xl bg-white"
                      onPress={() =>
                        navigation.navigate('RestaurantDetails', {
                          branch: item,
                          displayName,
                        })
                      }
                    >
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          className="h-20 w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="h-20 w-full items-center justify-center bg-gray-100">
                          <Ionicons
                            name="storefront-outline"
                            size={28}
                            color="#D1D5DB"
                          />
                        </View>
                      )}
                      <View className="p-1.5">
                        <Text
                          className="text-[11px] font-semibold text-gray-700"
                          numberOfLines={1}
                        >
                          {item.vendorName}
                        </Text>
                        <Text
                          className="text-[10px] text-gray-500"
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.distanceKm != null && (
                          <Text className="mt-0.5 text-[10px] text-orange-500">
                            {item.distanceKm < 1
                              ? t('ghost_pin_creation.distance_meters', {
                                  count: Math.round(item.distanceKm * 1000),
                                })
                              : t('ghost_pin_creation.distance_kilometers', {
                                  count: Number(item.distanceKm.toFixed(1)),
                                })}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}

          {/* Feedback Section with Images */}
          <View className="mb-5">
            <Text className="mb-1.5 text-base font-semibold text-gray-700">
              {t('ghost_pin_creation.feedback.title')}
            </Text>
            <Text className="mb-3 text-sm text-gray-500">
              {t('ghost_pin_creation.feedback.subtitle')}
            </Text>

            {/* Star rating */}
            <View className="mb-6 mt-5 items-center">
              <Text className="mb-3 text-base font-medium text-gray-700">
                {t('ghost_pin_creation.feedback.your_rating')}
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
                  {t('ghost_pin_creation.feedback.tags_label')}
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

            {/* Feedback Text Input */}
            <TextInput
              className="mb-3 min-h-[100px] rounded-xl border border-gray-200 px-4 py-3 text-gray-800"
              placeholder={t('ghost_pin_creation.feedback.placeholder')}
              placeholderTextColor="#9CA3AF"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              textAlignVertical="top"
              maxLength={500}
              returnKeyType="default"
            />
            <Text className="mb-3 text-sm text-gray-500">
              {t('ghost_pin_creation.feedback.character_count', {
                count: feedback.length,
              })}
            </Text>

            {/* Image Upload for Feedback */}
            <View className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <View className="mb-2 flex-row items-center">
                <Ionicons
                  name="images-outline"
                  size={16}
                  color="#6B7280"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-base font-semibold text-gray-700">
                  {t('ghost_pin_creation.feedback.image_section_title')}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-3">
                {/* Selected Images */}
                {selectedImages.map((image, index) => (
                  <View key={index} className="relative h-24 w-24">
                    <Image
                      source={{ uri: image.uri }}
                      className="h-full w-full rounded-xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(index)}
                      className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-sm"
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Image Button */}
                {selectedImages.length < MAX_IMAGES && (
                  <TouchableOpacity
                    onPress={showImagePickerOptions}
                    className="h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
                    <Text className="mt-1 text-sm text-gray-400">
                      {t('ghost_pin_creation.feedback.image_counter', {
                        selected: selectedImages.length,
                        max: MAX_IMAGES,
                      })}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text className="mt-2 text-sm text-gray-500">
                {t('ghost_pin_creation.feedback.image_hint')}
              </Text>
            </View>
          </View>

          {/* Error */}
          {submitError && (
            <View className="mb-5 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-base text-red-600">{submitError}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            className={`items-center rounded-xl py-4 ${
              isSubmitting ? 'bg-gray-300' : 'bg-primary'
            }`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                {t('ghost_pin_creation.form.submit')}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <LocationPickerMap
          onConfirm={handleLocationConfirm}
          onBack={() => setShowLocationPicker(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};
