import type { APIErrorResponse } from '@custom-types/apiResponse';
import { Ionicons } from '@expo/vector-icons';
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
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

  const [name, setName] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [ward, setWard] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);

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

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Address search ──
  const handleAddressSearch = useCallback((text: string) => {
    setAddressQuery(text);
    // Clear confirmed location when user types again
    setAddressDetail('');
    setWard('');
    setCity('');
    setLat(null);
    setLong(null);

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
      }
      setIsGeocodingAddress(false);
    },
    [addressError]
  );

  // ── Location picker confirm (map fallback) ──
  const handleLocationConfirm = useCallback(
    (location: PickedLocation): void => {
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
    },
    [addressError]
  );

  // ── Image picker handlers ──
  const handlePickFromLibrary = async (): Promise<void> => {
    const remainingSlots = MAX_IMAGES - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert(
        'Giới hạn ảnh',
        `Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh`
      );
      return;
    }

    const result = await pickImagesFromLibrary({
      maxImages: remainingSlots,
      quality: 0.8,
    });

    if (result.error === 'permission_denied') {
      Alert.alert(
        'Quyền truy cập',
        'Vui lòng cho phép ứng dụng truy cập thư viện ảnh trong Cài đặt.'
      );
    } else if (result.images.length > 0) {
      setSelectedImages((prev) => [...prev, ...result.images]);
    }
  };

  const handleTakePhoto = async (): Promise<void> => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert(
        'Giới hạn ảnh',
        `Bạn chỉ có thể tải lên tối đa ${MAX_IMAGES} ảnh`
      );
      return;
    }

    const result = await takePhotoWithCamera({ quality: 0.8 });

    if (result.error === 'permission_denied') {
      Alert.alert(
        'Quyền truy cập',
        'Vui lòng cho phép ứng dụng truy cập máy ảnh trong Cài đặt.'
      );
    } else if (result.images.length > 0) {
      setSelectedImages((prev) => [...prev, ...result.images]);
    }
  };

  const handleRemoveImage = (index: number): void => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const showImagePickerOptions = (): void => {
    Alert.alert('Thêm ảnh', 'Chọn nguồn ảnh', [
      {
        text: 'Chụp ảnh',
        onPress: handleTakePhoto,
      },
      {
        text: 'Chọn từ thư viện',
        onPress: handlePickFromLibrary,
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ]);
  };

  // ── Validation ──
  const validate = (): boolean => {
    let valid = true;
    if (name.trim().length < 2) {
      setNameError('Tên quán phải có ít nhất 2 ký tự');
      valid = false;
    } else {
      setNameError(null);
    }
    if (!addressDetail.trim() || lat == null || long == null) {
      setAddressError('Vui lòng chọn địa chỉ từ gợi ý hoặc bản đồ');
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

      // 2. Upload images if any selected
      if (
        selectedImages.length > 0 &&
        response.data.branchId != null &&
        response.data.branchId > 0
      ) {
        try {
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
          await axiosApi.ghostPinApi.uploadBranchImages(
            response.data.branchId,
            formData
          );
        } catch (uploadError) {
          console.warn('Failed to upload images:', uploadError);
          // Don't fail the entire creation if image upload fails
        }
      }

      Alert.alert('Thành công', 'Ghim quán ăn đã được tạo thành công!', [
        { text: 'OK', onPress: (): void => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      const apiError = error as APIErrorResponse;
      if (apiError?.status === 409) {
        setSubmitError('Đã có quán gần đây được ghi nhận');
      } else {
        setSubmitError('Không thể tạo ghim. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-bold text-gray-800">
            Thêm quán ăn mới
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Name (required) */}
          <View className="mb-5">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">
              Tên quán <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border px-4 py-3 text-sm text-gray-800 ${
                nameError ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Nhập tên quán ăn"
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
              <Text className="mt-1 text-xs text-red-500">{nameError}</Text>
            )}
          </View>

          {/* Address search with autocomplete */}
          <View className="mb-5">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">
              Địa chỉ <Text className="text-red-500">*</Text>
            </Text>
            <View
              className={`flex-row items-center rounded-xl border px-3 py-3 ${
                addressError ? 'border-red-400' : 'border-gray-200'
              }`}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={lat != null ? '#a1d973' : '#9CA3AF'}
                style={{ marginRight: 8 }}
              />
              <TextInput
                className="flex-1 text-sm text-gray-800"
                placeholder="Tìm kiếm địa chỉ..."
                placeholderTextColor="#9CA3AF"
                value={addressQuery}
                onChangeText={handleAddressSearch}
                returnKeyType="search"
              />
              {isSearching || isGeocodingAddress ? (
                <ActivityIndicator size="small" color="#a1d973" />
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
                      className="text-sm font-medium text-gray-800"
                      numberOfLines={1}
                    >
                      {prediction.mainText}
                    </Text>
                    {prediction.secondaryText ? (
                      <Text
                        className="mt-0.5 text-xs text-gray-400"
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
              <Text className="mt-1 text-xs text-red-500">{addressError}</Text>
            )}
          </View>

          {/* Image Upload Section */}
          <View className="mb-5">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">
              Ảnh quán ăn (Tùy chọn)
            </Text>
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
                  className="h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50"
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
                  <Text className="mt-1 text-xs text-gray-400">
                    {selectedImages.length}/{MAX_IMAGES}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className="mt-2 text-xs text-gray-500">
              Thêm ảnh để giúp mọi người dễ dàng nhận diện quán hơn
            </Text>
          </View>

          {/* Error */}
          {submitError && (
            <View className="mb-5 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm text-red-600">{submitError}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            className={`items-center rounded-xl py-4 ${
              isSubmitting ? 'bg-gray-300' : 'bg-[#a1d973]'
            }`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Xác nhận</Text>
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
