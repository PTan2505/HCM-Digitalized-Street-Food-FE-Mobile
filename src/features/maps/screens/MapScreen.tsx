import { Ionicons } from '@expo/vector-icons';
import type { MapVendor } from '@features/home/types/stall';
import { DetailCard } from '@features/maps/components/DetailCard';
import { CAMERA_BOTTOM_PADDING, Maps } from '@features/maps/components/Maps';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { type CameraRef } from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import type { JSX } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

// ---------------------------------------------------------------------------
// MapScreen
// ---------------------------------------------------------------------------
export const MapScreen = (): JSX.Element => {
  const cameraRef = useRef<CameraRef>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  // TODO: Replace with axiosApi.stallSearchApi.getMapVendors() when API is ready
  const [vendors] = useState<MapVendor[]>(MOCK_VENDORS);
  const [isPeeked, setIsPeeked] = useState(false);
  const { permissionStatus, retryPermission, coords } = useLocationPermission();
  const userCenter = coords
    ? ([coords.longitude, coords.latitude] as [number, number])
    : null;
  const navigation = useNavigation();

  // ── Marker press handler ──────────────────────────────────
  const onMarkerPress = useCallback(
    (vendorId: string) => {
      const vendor = vendors.find((v) => v.vendorId === vendorId);
      if (!vendor) return;

      setSelectedVendorId(vendorId);
      setIsPeeked(false);

      /**
       * Camera Padding / Offset Explanation:
       * ------------------------------------
       */
      cameraRef.current?.setCamera({
        centerCoordinate: [vendor.long, vendor.lat],
        zoomLevel: 14,
        animationDuration: 700,
        animationMode: 'flyTo',
        padding: {
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: CAMERA_BOTTOM_PADDING,
        },
      });
    },
    [vendors]
  );

  // ── Detail card close ─────────────────────────────────────
  const onCloseDetail = useCallback(() => {
    setSelectedVendorId(null);
    setIsPeeked(false);

    // Reset camera padding so map re-centers normally
    cameraRef.current?.setCamera({
      padding: {
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
      },
      animationDuration: 400,
      animationMode: 'easeTo',
    });
  }, []);

  // ── User drag → peek card (keep marker selected) ─────────
  const onUserDrag = useCallback(() => {
    setIsPeeked(true);
  }, []);

  // ── Expand card back from peek ────────────────────────────
  const onExpand = useCallback(() => {
    setIsPeeked(false);
  }, []);

  // ── Permission states ─────────────────────────────────────
  if (
    permissionStatus === Location.PermissionStatus.UNDETERMINED ||
    (permissionStatus === Location.PermissionStatus.GRANTED && !userCenter)
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#a1d973" />
        <Text className="mt-4 text-base text-[#666]">
          Đang yêu cầu quyền truy cập vị trí...
        </Text>
      </View>
    );
  }

  if (permissionStatus === Location.PermissionStatus.DENIED) {
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

  // ── Resolve selected vendor for detail card ───────────────
  const selectedVendor = selectedVendorId
    ? (vendors.find((v) => v.vendorId === selectedVendorId) ?? null)
    : null;

  return (
    <View className="flex-1">
      {/* Map layer */}
      <View className="absolute left-3 top-[60px] z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="h-9 w-9 items-center justify-center rounded-full bg-black/50"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <Maps
        cameraRef={cameraRef}
        initialCenter={userCenter!}
        selectedVendorId={selectedVendorId}
        isPeeked={isPeeked}
        onMarkerPress={onMarkerPress}
        onUserDrag={onUserDrag}
        vendors={vendors}
      />

      {/* Detail card — slides up when a vendor is selected */}
      {selectedVendor && (
        <DetailCard
          vendor={selectedVendor}
          isPeeked={isPeeked}
          onClose={onCloseDetail}
          onExpand={onExpand}
        />
      )}
    </View>
  );
};
