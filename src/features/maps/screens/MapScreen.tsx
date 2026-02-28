import { DetailCard } from '@features/maps/components/DetailCard';
import { CAMERA_BOTTOM_PADDING, Maps } from '@features/maps/components/Maps';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { type CameraRef } from '@maplibre/maplibre-react-native';
import type { JSX } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

// ---------------------------------------------------------------------------
// MapScreen
// ---------------------------------------------------------------------------
export const MapScreen = (): JSX.Element => {
  const cameraRef = useRef<CameraRef>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isPeeked, setIsPeeked] = useState(false);
  const { permissionStatus, retryPermission } = useLocationPermission();

  // ── Marker press handler ──────────────────────────────────
  const onMarkerPress = useCallback((vendorId: string) => {
    const vendor = MOCK_VENDORS.find((v) => v.vendorId === vendorId);
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
  }, []);

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

  // ── Resolve selected vendor for detail card ───────────────
  const selectedVendor = selectedVendorId
    ? (MOCK_VENDORS.find((v) => v.vendorId === selectedVendorId) ?? null)
    : null;

  return (
    <View className="flex-1">
      {/* Map layer */}
      <Maps
        cameraRef={cameraRef}
        selectedVendorId={selectedVendorId}
        isPeeked={isPeeked}
        onMarkerPress={onMarkerPress}
        onUserDrag={onUserDrag}
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
