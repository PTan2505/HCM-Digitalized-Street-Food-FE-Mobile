import { DetailCard } from '@features/maps/components/DetailCard';
import { CAMERA_BOTTOM_PADDING, Maps } from '@features/maps/components/Maps';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { type CameraRef } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import type { JSX } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const HCMC_CENTER: [number, number] = [106.6297, 10.8231];

// ---------------------------------------------------------------------------
// MapScreen
// ---------------------------------------------------------------------------
export const MapScreen = (): JSX.Element => {
  const cameraRef = useRef<CameraRef>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isPeeked, setIsPeeked] = useState(false);
  const [userCenter, setUserCenter] = useState<[number, number] | null>(null);
  const { permissionStatus, retryPermission } = useLocationPermission();

  // Resolve user location once permission is granted
  useEffect(() => {
    if (permissionStatus !== 'granted') return;

    void (async (): Promise<void> => {
      try {
        // Try cached position first (instant)
        const cached = await Location.getLastKnownPositionAsync();
        if (cached) {
          setUserCenter([cached.coords.longitude, cached.coords.latitude]);
          return;
        }

        // No cache — get current position
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserCenter([current.coords.longitude, current.coords.latitude]);
      } catch {
        setUserCenter(HCMC_CENTER);
      }
    })();
  }, [permissionStatus]);

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
  if (
    permissionStatus === 'loading' ||
    (permissionStatus === 'granted' && !userCenter)
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
        initialCenter={userCenter!}
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
