import { Maps } from '@features/maps/components/Maps';
import {
  CARD_SPACING,
  CARD_WIDTH,
  VendorList,
} from '@features/maps/components/VendorList';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import type { JSX } from 'react';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import MapView from 'react-native-maps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// Approximate card height: 192 (image) + 64 (gallery) + 120 (info) + 24 (padding) = 400
const CARD_HEIGHT = 400;

export const MapScreen = (): JSX.Element => {
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const isMarkerPressRef = useRef(false);
  const { permissionStatus, retryPermission } = useLocationPermission();

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const vendor = viewableItems[0].item;
        setSelectedVendorId(vendor.vendorId);

        // Only animate map if it's not from a marker press
        if (!isMarkerPressRef.current) {
          // Calculate offset to center marker in visible map area
          const latitudeDelta = 0.02;
          // Offset the latitude so marker appears centered in visible area
          const latitudeOffset =
            (latitudeDelta * CARD_HEIGHT) / (SCREEN_HEIGHT * 2);

          mapRef.current?.animateToRegion(
            {
              latitude: vendor.lat - latitudeOffset,
              longitude: vendor.long,
              latitudeDelta: latitudeDelta,
              longitudeDelta: 0.02,
            },
            350
          );
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onMarkerPress = (vendorId: string): void => {
    const index = MOCK_VENDORS.findIndex((v) => v.vendorId === vendorId);
    if (index !== -1) {
      const vendor = MOCK_VENDORS[index];
      setSelectedVendorId(vendorId);

      // Set flag to prevent onViewableItemsChanged from animating the map
      isMarkerPressRef.current = true;

      // Calculate offset to center marker in visible map area
      const latitudeDelta = 0.02;
      const latitudeOffset =
        (latitudeDelta * CARD_HEIGHT) / (SCREEN_HEIGHT * 2);

      // Animate map directly to the vendor with offset
      mapRef.current?.animateToRegion(
        {
          latitude: vendor.lat - latitudeOffset,
          longitude: vendor.long,
          latitudeDelta: latitudeDelta,
          longitudeDelta: 0.02,
        },
        350
      );

      const offset = index * (CARD_WIDTH + CARD_SPACING);
      flatListRef.current?.scrollToOffset({
        offset,
        animated: true,
      });

      // Reset flag after scroll completes
      setTimeout(() => {
        isMarkerPressRef.current = false;
      }, 500);
    }
  };

  if (permissionStatus === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#a1d973" />
        <Text className="mt-4 text-base text-[#666]">
          Đang yêu cầu quyền truy cập vị trí...
        </Text>
      </View>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-2 text-xl font-bold text-[#333]">
          Cần quyền truy cập vị trí
        </Text>
        <Text className="mb-6 text-center text-base text-[#666]">
          Ứng dụng cần quyền truy cập vị trí để hiển thị bản đồ và các quán ăn
          gần bạn.
        </Text>
        <TouchableOpacity
          className="rounded-lg bg-[#a1d973] px-6 py-3"
          onPress={retryPermission}
        >
          <Text className="text-base font-semibold text-white">
            Cấp quyền truy cập
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Maps
        mapRef={mapRef}
        selectedVendorId={selectedVendorId}
        onMarkerPress={onMarkerPress}
      />
      <VendorList
        ref={flatListRef}
        selectedVendorId={selectedVendorId}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};
