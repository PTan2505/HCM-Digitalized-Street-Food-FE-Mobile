import type { APIErrorResponse } from '@custom-types/apiResponse';
import { Ionicons } from '@expo/vector-icons';
import type { PickedLocation } from '@features/maps/components/LocationPickerMap';
import { LocationPickerMap } from '@features/maps/components/LocationPickerMap';
import { getPlaceOSM } from '@features/maps/services/geocoding';
import { axiosApi } from '@lib/api/apiInstance';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const [addressDetail, setAddressDetail] = useState('');
  const [ward, setWard] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Location picker modal
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // ── Location picker confirm ──
  const handleLocationConfirm = useCallback(
    async (location: PickedLocation): Promise<void> => {
      const [lng, pickedLat] = location.coordinate;
      setLat(pickedLat);
      setLong(lng);
      setShowLocationPicker(false);

      // Reverse geocode with OSM format to fill address fields
      setIsGeocodingAddress(true);
      const result = await getPlaceOSM(pickedLat, lng);
      if (result) {
        setAddressDetail(result.shortAddress);
        setWard(result.locality);
        setCity(result.region);
        if (addressError) setAddressError(null);
      } else {
        // Fallback: use the address from LocationPickerMap
        setAddressDetail(location.address);
      }
      setIsGeocodingAddress(false);
    },
    [addressError]
  );

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
      setAddressError('Vui lòng chọn vị trí trên bản đồ');
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
      await axiosApi.ghostPinApi.createGhostPin({
        name: name.trim(),
        addressDetail: addressDetail.trim(),
        ward: ward.trim() || null,
        city: city.trim(),
        lat: lat!,
        long: long!,
      });
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

          {/* Address Detail (tap to open location picker) */}
          <View className="mb-5">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">
              Địa chỉ <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              className={`flex-row items-center rounded-xl border px-4 py-3 ${
                addressError ? 'border-red-400' : 'border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={addressDetail ? '#a1d973' : '#9CA3AF'}
                style={{ marginRight: 8 }}
              />
              {isGeocodingAddress ? (
                <View className="flex-1 flex-row items-center">
                  <ActivityIndicator size="small" color="#a1d973" />
                  <Text className="ml-2 text-sm text-gray-400">
                    Đang lấy địa chỉ...
                  </Text>
                </View>
              ) : (
                <Text
                  className={`flex-1 text-sm ${
                    addressDetail ? 'text-gray-800' : 'text-gray-400'
                  }`}
                  numberOfLines={2}
                >
                  {addressDetail || 'Nhấn để chọn vị trí trên bản đồ'}
                </Text>
              )}
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            {addressError && (
              <Text className="mt-1 text-xs text-red-500">{addressError}</Text>
            )}
          </View>

          {/* Ward */}
          {/* <View className="mb-5">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">
              Phường / Xã
            </Text>
            <TextInput
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800"
              placeholder="Nhập phường / xã"
              placeholderTextColor="#9CA3AF"
              value={ward}
              onChangeText={setWard}
              maxLength={100}
              returnKeyType="next"
            />
          </View> */}

          {/* City */}
          {/* <View className="mb-5">
            <Text className="mb-1.5 text-sm font-semibold text-gray-700">
              Thành phố
            </Text>
            <TextInput
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800"
              placeholder="Nhập thành phố"
              placeholderTextColor="#9CA3AF"
              value={city}
              onChangeText={setCity}
              maxLength={100}
              returnKeyType="done"
            />
          </View> */}

          {/* Coordinates display (if selected) */}
          {/* {lat != null && long != null && (
            <View className="mb-5 flex-row gap-3">
              <View className="flex-1 rounded-xl bg-gray-50 px-3 py-2.5">
                <Text className="text-[10px] text-gray-400">Vĩ độ</Text>
                <Text className="text-xs text-gray-600">{lat.toFixed(6)}</Text>
              </View>
              <View className="flex-1 rounded-xl bg-gray-50 px-3 py-2.5">
                <Text className="text-[10px] text-gray-400">Kinh độ</Text>
                <Text className="text-xs text-gray-600">{long.toFixed(6)}</Text>
              </View>
            </View>
          )} */}

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
