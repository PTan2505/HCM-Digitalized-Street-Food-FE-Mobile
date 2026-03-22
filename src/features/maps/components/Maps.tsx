import MarkerIcon from '@assets/icons/marker.svg';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/home/types/branch';
import type { GhostPinResponse } from '@features/maps/api/ghostPinApi';
import {
  Camera,
  CircleLayer,
  FillLayer,
  LineLayer,
  Logger,
  MapView,
  MarkerView,
  ShapeSource,
  SymbolLayer,
  UserLocation,
  setAccessToken,
  type CameraRef,
  type MapViewRef,
} from '@maplibre/maplibre-react-native';
import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

// ── Config ──
setAccessToken(null);

// Suppress 429 rate-limit errors from the tile server.
Logger.setLogCallback((log) => {
  if (log.level === 'error' && log.message?.includes('status code 429')) {
    return true;
  }
  return false;
});

const DEFAULT_ZOOM = 14;

/** Camera bottom padding to offset the marker above the Detail Card (~300pt). */
export const CAMERA_BOTTOM_PADDING = 320;

const OPENMAP_VN_STYLE = `${
  process.env.EXPO_PUBLIC_OPENMAP_VN_STYLE ??
  'https://maptiles.openmap.vn/styles/day-v1/style.json'
}?apikey=${process.env.EXPO_PUBLIC_OPENMAP_API_KEY}`;

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

  'place-suburb', // Ẩn tên Phường, Quận
  'place-village', // Ẩn tên Xã, Thôn
  'place-town', // Ẩn tên Thị trấn
  'place-other', // Ẩn các địa danh khu dân cư nhỏ khác
] as const;

const HIDDEN_BUILDING_LAYERS = ['building'] as const;

const FADED_CASING_LAYERS = [
  // ── 1. ĐƯỜNG HẦM (TUNNELS) ──
  'tunnel-service-track-casing',
  'tunnel-minor-casing',
  'tunnel-secondary-tertiary-casing',
  'tunnel-trunk-primary-casing',
  'tunnel-motorway-casing',

  // ── 2. ĐƯỜNG BỘ MẶT ĐẤT (HIGHWAYS) ──
  'highway-motorway-link-casing',
  'highway-link-casing',
  'highway-minor-casing',
  'highway-minor-casing-service',
  'highway-trunk-casing',
  'highway-secondary-tertiary-casing',
  'highway-primary-casing',
  'highway-motorway-casing',

  // ── 3. CẦU VÀ CẦU VƯỢT (BRIDGES) ──
  'bridge-link-casing',
  'bridge-secondary-tertiary-casing',
  'bridge-trunk-primary-casing',
  'bridge-motorway-casing',
  'bridge-path-casing', // Viền cầu dành cho người đi bộ/xe đạp
] as const;

const FADED_ROAD_LAYERS = [
  // ── 1. RUỘT ĐƯỜNG HẦM ──
  'tunnel-service-track',
  'tunnel-minor',
  'tunnel-secondary-tertiary',
  'tunnel-trunk-primary',
  'tunnel-motorway',
  'tunnel-path',

  // ── 2. RUỘT ĐƯỜNG BỘ ──
  'highway-motorway-link',
  'highway-link',
  'highway-minor-service',
  'highway-minor',
  'highway-secondary-tertiary',
  'highway-trunk',
  'highway-primary',
  'highway-motorway',
  'highway-path',

  // ── 3. RUỘT CẦU ──
  'bridge-link',
  'bridge-secondary-tertiary',
  'bridge-trunk-primary',
  'bridge-path',
] as const;
// ── Priority Mapping (based on finalScore 0–1) ──
// 1 = High (always pill), 2 = Medium (pill at z≥13), 3 = Low (pill at z≥15)
const scoreToPriority = (finalScore: number): number => {
  if (finalScore >= 0.7) return 1; // High: always show full marker
  if (finalScore >= 0.3) return 2; // Medium: show at zoom ≥ 13
  return 3; // Low: show at zoom ≥ 15
};

// ── GeoJSON FeatureCollection Builder ──
const buildBranchGeoJSON = (
  branches: ActiveBranch[]
): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: branches.map((b) => ({
    type: 'Feature' as const,
    id: String(b.branchId),
    geometry: {
      type: 'Point' as const,
      coordinates: [b.long, b.lat],
    },
    properties: {
      id: String(b.branchId),
      name: b.vendorName ?? b.name,
      priority: scoreToPriority(b.finalScore),
      rating: b.avgRating,
      isActive: b.isActive,
      isVerified: b.isVerified,
    },
  })),
});

const SOURCE_ID = 'vendor-source';
const CIRCLE_LAYER_ID = 'vendor-dots';

// ── Zoom Thresholds (dot → full marker) ──
const ZOOM_THRESHOLD_STANDARD = 13; // Priority 2 (tier_standard)
const ZOOM_THRESHOLD_BASIC = 15; // Priority 3 (tier_basic)

const shouldShowFullMarker = (priority: number, zoom: number): boolean => {
  if (priority === 1) return true; // Premium: always full marker
  if (priority === 2) return zoom >= ZOOM_THRESHOLD_STANDARD;
  return zoom >= ZOOM_THRESHOLD_BASIC; // Basic
};

// Built dynamically from props in the component via useMemo

// ── CircleLayer Style (dot representation) ──
// Ghost Pins (isVerified=false) render as gray dashed-border dots; verified = green
const CIRCLE_STYLE = {
  circleRadius: [
    'interpolate',
    ['linear'],
    ['zoom'],
    10,
    7,
    14,
    10,
    18,
    12,
  ] as unknown as number,

  circleColor: [
    'case',
    ['==', ['get', 'isVerified'], false],
    '#9CA3AF',
    '#a1d973',
  ] as unknown as string,
  circleStrokeWidth: 2,
  circleStrokeColor: '#ffffff',

  circleOpacity: [
    'step',
    ['zoom'],
    ['match', ['get', 'priority'], 1, 0, 1],
    13,
    ['match', ['get', 'priority'], 1, 0, 2, 0, 1],
    15,
    0,
  ] as unknown as number,

  circleStrokeOpacity: [
    'step',
    ['zoom'],
    ['match', ['get', 'priority'], 1, 0, 1],
    13,
    ['match', ['get', 'priority'], 1, 0, 2, 0, 1],
    15,
    0,
  ] as unknown as number,
};

// ── VendorMarker — unselected pin (marker SVG + circular image) ──
interface VendorMarkerProps {
  imageUrl?: string;
}

const VendorMarker = ({ imageUrl }: VendorMarkerProps): JSX.Element => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, [opacity]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={fadeStyle}>
      <View style={{ width: 38, height: 52 }}>
        <MarkerIcon width={38} height={52} />
        <View
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'white',
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 28, height: 28 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="restaurant" size={14} color="#a1d973" />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// ── ActivePill — selected pill (green bg, spring animation) ──
interface ActivePillProps {
  label: string;
  rating: number;
}

const ActivePill = ({ label, rating }: ActivePillProps): JSX.Element => {
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View className="items-center">
        <View className="flex-row items-center rounded-full bg-[#a1d973] px-2.5 py-1.5 shadow-lg">
          <Ionicons
            name="restaurant"
            size={12}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text className="text-xs font-bold text-white" numberOfLines={1}>
            {label}
          </Text>
          <View className="ml-1.5 rounded-md bg-[#FFB800] px-1 py-px">
            <Text className="text-[10px] font-extrabold text-white">
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 7,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#a1d973',
            marginTop: -1,
          }}
        />
      </View>
    </Animated.View>
  );
};

// ── Maps Component ──

interface GhostPinMarkerCalloutProps {
  name: string;
  status: GhostPinResponse['status'];
}

const STATUS_LABEL: Record<GhostPinResponse['status'], string> = {
  pending: 'Đang chờ duyệt',
  approved: 'Đã được duyệt',
  claimed: 'Đã nhận',
  verified: 'Đã xác minh',
  rejected: 'Bị từ chối',
};

const GhostPinCallout = ({
  name,
  status,
}: GhostPinMarkerCalloutProps): JSX.Element => (
  <View className="items-center">
    <View className="rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-md">
      <Text className="text-xs font-bold text-gray-700" numberOfLines={1}>
        {name}
      </Text>
      <Text className="mt-0.5 text-[10px] text-gray-500">
        {STATUS_LABEL[status]}
      </Text>
    </View>
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#D1D5DB',
        marginTop: -1,
      }}
    />
  </View>
);

interface MapsProps {
  cameraRef: React.RefObject<CameraRef | null>;
  initialCenter: [number, number];
  selectedBranchId: number | null;
  isPeeked: boolean;
  onMarkerPress: (branchId: number) => void;
  onUserDrag?: () => void;
  /** Fired after map stops moving with the visible center coordinate [lng, lat] */
  onMapIdle?: (center: [number, number]) => void;
  branches?: ActiveBranch[];
  branchImageMap?: Record<number, string[]>;
  ghostPins?: GhostPinResponse[];
}

const PEEK_BAR_OFFSET = 20;

export const Maps = ({
  cameraRef,
  initialCenter,
  selectedBranchId,
  isPeeked,
  onMarkerPress,
  onUserDrag,
  onMapIdle,
  branches = [],
  branchImageMap = {},
  ghostPins = [],
}: MapsProps): JSX.Element => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapViewRef>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);

  const branchGeoJSON = useMemo(() => buildBranchGeoJSON(branches), [branches]);

  const branchMarkers = useMemo(
    () =>
      branches.map((b) => ({
        branchId: b.branchId,
        coordinate: [b.long, b.lat] as [number, number],
        priority: scoreToPriority(b.finalScore),
        label: b.vendorName ?? b.name,
        rating: b.avgRating,
        isVerified: b.isVerified,
        imageUrl: branchImageMap[b.branchId]?.[0],
      })),
    [branches, branchImageMap]
  );

  // ── FAB position ──
  const fabBottom = useSharedValue(insets.bottom + 40);

  useEffect(() => {
    const target = selectedBranchId
      ? isPeeked
        ? PEEK_BAR_OFFSET + 20
        : CAMERA_BOTTOM_PADDING + 20
      : 40;
    fabBottom.value = withTiming(insets.bottom + target, { duration: 250 });
  }, [selectedBranchId, isPeeked, insets.bottom, fabBottom]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    bottom: fabBottom.value,
  }));

  // ── User location ──
  const handleUserLocationUpdate = useCallback((location: MapLibreLocation) => {
    userLocationRef.current = [
      location.coords.longitude,
      location.coords.latitude,
    ];
  }, []);

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

  // ── Drag → peek ──
  const handleRegionWillChange = useCallback(
    (feature: RegionPayloadFeature) => {
      if (feature.properties.isUserInteraction && selectedBranchId) {
        onUserDrag?.();
      }
    },
    [selectedBranchId, onUserDrag]
  );

  // ── Zoom tracking (throttled to avoid rapid MarkerView mount/unmount) ──
  const lastZoomUpdateRef = useRef(0);
  const pendingZoomRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ZOOM_THROTTLE_MS = 150;

  const updateZoomBucket = useCallback((newZoom: number) => {
    const now = Date.now();
    const elapsed = now - lastZoomUpdateRef.current;

    const applyUpdate = (): void => {
      lastZoomUpdateRef.current = Date.now();
      setZoomLevel((prev) => {
        const thresholds = [ZOOM_THRESHOLD_STANDARD, ZOOM_THRESHOLD_BASIC];
        const prevBucket = thresholds.filter((t) => prev >= t).length;
        const newBucket = thresholds.filter((t) => newZoom >= t).length;
        return prevBucket !== newBucket ? newZoom : prev;
      });
    };

    if (elapsed >= ZOOM_THROTTLE_MS) {
      if (pendingZoomRef.current) {
        clearTimeout(pendingZoomRef.current);
        pendingZoomRef.current = null;
      }
      applyUpdate();
    } else {
      pendingZoomRef.current ??= setTimeout(() => {
        pendingZoomRef.current = null;
        applyUpdate();
      }, ZOOM_THROTTLE_MS - elapsed);
    }
  }, []);

  const handleRegionDidChange = useCallback(
    (feature: RegionPayloadFeature) => {
      updateZoomBucket(feature.properties.zoomLevel);

      // Report visible center to parent when user interaction ends
      if (feature.properties.isUserInteraction) {
        const bounds = feature.properties.visibleBounds;
        if (bounds?.[0] && bounds?.[1]) {
          const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
          const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
          onMapIdle?.([centerLng, centerLat]);
        }
      }
    },
    [updateZoomBucket, onMapIdle]
  );

  // ── Continuous zoom tracking during gestures ──
  const handleRegionIsChanging = useCallback(
    (feature: RegionPayloadFeature) => {
      updateZoomBucket(feature.properties.zoomLevel);
    },
    [updateZoomBucket]
  );

  // ── Visible pill markers (selected branch always included; Ghost Pins excluded) ──
  const visibleMarkers = useMemo(
    () =>
      branchMarkers.filter(
        (m) =>
          m.isVerified &&
          (m.branchId === selectedBranchId ||
            shouldShowFullMarker(m.priority, zoomLevel))
      ),
    [branchMarkers, zoomLevel, selectedBranchId]
  );

  // ── ShapeSource press → select branch ──
  const handleSourcePress = useCallback(
    (event: {
      features: GeoJSON.Feature[];
      coordinates: { latitude: number; longitude: number };
      point: { x: number; y: number };
    }) => {
      const feature = event.features?.[0];
      const id = feature?.properties?.id as string | undefined;
      if (id) {
        onMarkerPress(Number(id));
      }
    },
    [onMarkerPress]
  );

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        mapStyle={OPENMAP_VN_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingStyle={() => setStyleLoaded(true)}
        onRegionWillChange={handleRegionWillChange}
        onRegionDidChange={handleRegionDidChange}
        onRegionIsChanging={handleRegionIsChanging}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: initialCenter,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />

        <UserLocation visible onUpdate={handleUserLocationUpdate} />

        {/* Hide unwanted labels from base style */}
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
            {FADED_CASING_LAYERS.map((layerId) => (
              <LineLayer
                key={layerId}
                id={layerId}
                style={{
                  lineColor: '#e0e0e0', // Màu xám nhạt
                  lineOpacity: 0.6,
                }}
              />
            ))}
            {FADED_ROAD_LAYERS.map((layerId) => (
              <LineLayer
                key={layerId}
                id={layerId}
                style={{
                  lineColor: '#ffffff',
                  lineOpacity: 0.7,
                }}
              />
            ))}
          </>
        )}

        {/* Semantic Zoom — CircleLayer dots at low zoom */}
        <ShapeSource
          id={SOURCE_ID}
          shape={branchGeoJSON}
          onPress={handleSourcePress}
          hitbox={{ width: 44, height: 44 }}
        >
          <CircleLayer id={CIRCLE_LAYER_ID} style={CIRCLE_STYLE} />
        </ShapeSource>

        {/* Pill Markers — content swaps between white/green pill */}
        {visibleMarkers.map((marker) => (
          <MarkerView
            key={marker.branchId}
            coordinate={marker.coordinate}
            anchor={{ x: 0.5, y: 1 }}
            allowOverlap
          >
            {marker.branchId === selectedBranchId ? (
              <ActivePill label={marker.label} rating={marker.rating} />
            ) : (
              <Pressable onPress={() => onMarkerPress(marker.branchId)}>
                <VendorMarker imageUrl={marker.imageUrl} />
              </Pressable>
            )}
          </MarkerView>
        ))}

        {/* Ghost Pin Markers — grey unverified markers with status callout */}
        {ghostPins.map((pin) => (
          <MarkerView
            key={`ghost-${pin.ghostPinId}`}
            coordinate={[pin.long, pin.lat]}
            anchor={{ x: 0.5, y: 1 }}
            allowOverlap
          >
            <GhostPinCallout name={pin.name} status={pin.status} />
          </MarkerView>
        ))}
      </MapView>

      {/* Locate Me FAB */}
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
