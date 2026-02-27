import { Ionicons } from '@expo/vector-icons';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import {
  Camera,
  FillLayer,
  MapView,
  MarkerView,
  setAccessToken,
  SymbolLayer,
  UserLocation,
  type CameraRef,
  type MapViewRef,
} from '@maplibre/maplibre-react-native';
import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Shape of the location object from MapLibre's UserLocation onUpdate */
interface MapLibreLocation {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    heading?: number;
    course?: number;
    speed?: number;
  };
  timestamp?: number;
}

/** RegionPayload from MapLibre onRegionWillChange / onRegionDidChange */
interface RegionPayloadFeature {
  properties: {
    isUserInteraction: boolean;
    zoomLevel: number;
    heading: number;
    animated: boolean;
    pitch: number;
    visibleBounds: [number[], number[]];
  };
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
setAccessToken(null);

const HCMC_CENTER: [number, number] = [106.6297, 10.8231];
const DEFAULT_ZOOM = 14;

/**
 * Camera bottom padding (in points) to offset the marker above the Detail Card.
 * The card is ~300pt tall, so we push the camera's logical center upward
 * so the focused marker sits well above the card.
 */
export const CAMERA_BOTTOM_PADDING = 320;

const OPENMAP_VN_STYLE = `${
  process.env.EXPO_PUBLIC_OPENMAP_VN_STYLE ??
  'https://maptiles.openmap.vn/styles/day-v1/style.json'
}?apikey=${process.env.EXPO_PUBLIC_OPENMAP_API_KEY}`;

/** Symbol layer IDs from the OpenMapVN style to hide (POIs, transit, etc.) */
const HIDDEN_SYMBOL_LAYERS = [
  'poi-level-street-furniture',
  'poi-natural-tree',
  'poi-level-3',
  'poi-level-2',
  'poi-level-1',
  'poi-level-0',
  'poi-level-public-transports-2',
  'poi-level-public-transports-1',
  'airport-label-major',
  'building-label',
  'label-housenum',
  'traffic_signals',
] as const;

// For hiding the physical blocks of the tools
const HIDDEN_BUILDING_LAYERS = [
  'building', // 2D building fill
] as const;

// ---------------------------------------------------------------------------
// Helper — price label from tier
// ---------------------------------------------------------------------------
const tierToPrice = (tierId: string): string => {
  switch (tierId) {
    case 'tier_premium':
      return '$$$';
    case 'tier_standard':
      return '$$';
    default:
      return '$';
  }
};

// ---------------------------------------------------------------------------
// VendorMarker (pill-shaped, TripAdvisor-style)
// ---------------------------------------------------------------------------
interface VendorMarkerProps {
  label: string;
  rating: number;
  isSelected: boolean;
}

const VendorMarker = ({
  label,
  rating,
  isSelected,
}: VendorMarkerProps): JSX.Element => {
  return (
    <View className="items-center">
      {/* Pill body */}
      <View
        className={`flex-row items-center rounded-full px-2.5 py-1.5 shadow-md ${
          isSelected
            ? 'scale-110 bg-[#a1d973]'
            : 'border border-gray-200 bg-white'
        }`}
      >
        <Ionicons
          name="restaurant"
          size={12}
          color={isSelected ? '#fff' : '#a1d973'}
          style={{ marginRight: 4 }}
        />
        <Text
          className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}
          numberOfLines={1}
        >
          {label}
        </Text>
        <View className="ml-1.5 rounded-md bg-[#FFB800] px-1 py-px">
          <Text className="text-[10px] font-extrabold text-white">
            {rating.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Triangle pointer */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 7,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: isSelected ? '#a1d973' : '#fff',
          marginTop: -1,
        }}
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Maps (main component)
// ---------------------------------------------------------------------------
interface MapsProps {
  cameraRef: React.RefObject<CameraRef | null>;
  selectedVendorId: string | null;
  isPeeked: boolean;
  onMarkerPress: (vendorId: string) => void;
  /** Called when user manually drags the map (to dismiss detail card) */
  onUserDrag?: () => void;
}

/** Height of the peek bar (py-3 top+bottom ~24 + content ~20) + card outer pb-8 (32) + gap */
const PEEK_BAR_OFFSET = 20;

export const Maps = ({
  cameraRef,
  selectedVendorId,
  isPeeked,
  onMarkerPress,
  onUserDrag,
}: MapsProps): JSX.Element => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapViewRef>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const hasCenteredOnUser = useRef(false);

  // Animated FAB position — slides smoothly like the DetailCard
  const fabBottom = useSharedValue(insets.bottom + 40);

  useEffect(() => {
    const target = selectedVendorId
      ? isPeeked
        ? PEEK_BAR_OFFSET + 20
        : CAMERA_BOTTOM_PADDING + 20
      : 40;
    fabBottom.value = withTiming(insets.bottom + target, { duration: 250 });
  }, [selectedVendorId, isPeeked, insets.bottom, fabBottom]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    bottom: fabBottom.value,
  }));

  // Track user location — on first fix, fly camera to user position
  const handleUserLocationUpdate = useCallback(
    (location: MapLibreLocation) => {
      userLocationRef.current = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      if (!hasCenteredOnUser.current) {
        hasCenteredOnUser.current = true;
        cameraRef.current?.setCamera({
          centerCoordinate: userLocationRef.current,
          zoomLevel: 14,
          animationDuration: 1000,
          animationMode: 'easeTo',
        });
      }
    },
    [cameraRef]
  );

  // Fly to user location
  const handleLocateMe = useCallback(() => {
    const coords = userLocationRef.current;
    if (!coords) return;

    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 15,
      pitch: 0,
      animationDuration: 800,
      animationMode: 'easeTo',
    });
  }, [cameraRef]);

  /**
   * Detect user-initiated map drags vs programmatic camera moves.
   * `isUserInteraction` is true only when the user physically touches/drags.
   */
  const handleRegionWillChange = useCallback(
    (feature: RegionPayloadFeature) => {
      if (feature.properties.isUserInteraction && selectedVendorId) {
        onUserDrag?.();
      }
    },
    [selectedVendorId, onUserDrag]
  );

  return (
    <View className="flex-1">
      {/* ── Map ──────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        mapStyle={OPENMAP_VN_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingStyle={() => setStyleLoaded(true)}
        onRegionWillChange={handleRegionWillChange}
      >
        {/* Camera */}
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: HCMC_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />

        {/* User location puck */}
        <UserLocation visible onUpdate={handleUserLocationUpdate} />

        {/* Hide unwanted POI / transit / building labels */}
        {styleLoaded && (
          <>
            {HIDDEN_SYMBOL_LAYERS.map((layerId) => (
              <SymbolLayer
                key={layerId}
                id={layerId}
                style={{ visibility: 'none' }}
              />
            ))}
            {HIDDEN_BUILDING_LAYERS.map((layerId) => (
              <FillLayer
                key={layerId}
                id={layerId}
                style={{ visibility: 'none' }}
              />
            ))}
          </>
        )}

        {/* Vendor markers */}
        {MOCK_VENDORS.map((vendor) => {
          const isSelected = selectedVendorId === vendor.vendorId;
          return (
            <MarkerView
              key={vendor.vendorId}
              coordinate={[vendor.long, vendor.lat]}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
              isSelected={isSelected}
            >
              <Pressable onPress={() => onMarkerPress(vendor.vendorId)}>
                <VendorMarker
                  label={tierToPrice(vendor.tierId)}
                  rating={vendor.avgRating}
                  isSelected={isSelected}
                />
              </Pressable>
            </MarkerView>
          );
        })}
      </MapView>

      {/* ── Locate Me FAB — animates position with detail card ── */}
      <Animated.View
        className="absolute right-4"
        style={fabAnimatedStyle}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleLocateMe}
          className="h-14 w-14 items-center justify-center rounded-full shadow-md active:scale-95 active:bg-gray-100"
        >
          <Ionicons name="navigate-circle" size={48} color="#333" />
        </Pressable>
      </Animated.View>
    </View>
  );
};
