import markerSelectedPng from '@assets/icons/marker-selected.png';
import MarkerSelectedIcon from '@assets/icons/marker-selected.svg';
import markerPng from '@assets/icons/marker.png';
import MarkerIcon from '@assets/icons/marker.svg';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/home/types/branch';
import type { GhostPinResponse } from '@features/maps/api/ghostPinApi';
import {
  Camera,
  CircleLayer,
  FillExtrusionLayer,
  Images,
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
import { useTranslation } from 'react-i18next';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

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
    COLORS.primary,
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

// ── VendorMarker — pin (marker SVG + circular image) ──
interface VendorMarkerProps {
  imageUrl?: string;
  isSelected?: boolean;
}

const VendorMarker = ({
  imageUrl,
  isSelected,
}: VendorMarkerProps): JSX.Element => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, [opacity]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const PinIcon = isSelected ? MarkerSelectedIcon : MarkerIcon;

  const inner = (
    <View style={{ width: 38, height: 52 }}>
      <PinIcon width={38} height={52} />
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
            <Ionicons name="restaurant" size={14} color={COLORS.primary} />
          </View>
        )}
      </View>
    </View>
  );

  return <Animated.View style={fadeStyle}>{inner}</Animated.View>;
};

// ── Android: Generate composite marker bitmaps (pin + vendor photo) ──
// SymbolLayer can only display pre-registered static images. To show vendor
// photos inside pins, we render hidden VendorMarker views offscreen, capture
// them as PNG bitmaps via react-native-view-shot, and register them as map
// images keyed by branchId.

interface MarkerBitmapItemProps {
  branchId: number;
  imageUrl?: string;
  isSelected?: boolean;
  onCapture: (key: string, uri: string) => void;
}

const MARKER_CAPTURE_MAX_RETRIES = 3;

const MarkerBitmapItem = ({
  branchId,
  imageUrl,
  isSelected,
  onCapture,
}: MarkerBitmapItemProps): JSX.Element => {
  const viewRef = useRef<View>(null);
  // Start as true when there's no image to wait for; set to true once the
  // image finishes loading (or errors) so the capture effect can fire.
  const [imageReady, setImageReady] = useState(!imageUrl);
  const [imageError, setImageError] = useState(false);
  // Incremented on each failed capture attempt to re-trigger the effect.
  const [retryCount, setRetryCount] = useState(0);
  const captureSucceeded = useRef(false);

  const captureKey = isSelected
    ? `marker-selected-${branchId}`
    : `marker-${branchId}`;

  useEffect(() => {
    if (!imageReady || captureSucceeded.current) return;

    // Each retry waits a bit longer, giving the native view more time to paint.
    const delay = 120 + retryCount * 150; // 120ms → 270ms → 420ms → 570ms
    const timer = setTimeout(async () => {
      try {
        if (!viewRef.current) return;
        const uri = await captureRef(viewRef, {
          format: 'png',
          quality: 1,
          // Fixed 2× output so the bitmap is always 76×104px regardless of
          // device pixel ratio. iconSize: 0.5 then maps it back to 38×52dp.
          width: 76,
          height: 104,
        });
        captureSucceeded.current = true;
        onCapture(captureKey, uri);
      } catch {
        // Native view may not be ready yet — retry up to MAX_RETRIES times.
        if (retryCount < MARKER_CAPTURE_MAX_RETRIES) {
          setRetryCount((r) => r + 1);
        }
      }
    }, delay);

    return (): void => clearTimeout(timer);
  }, [imageReady, captureKey, onCapture, retryCount]);

  const PinIcon = isSelected ? MarkerSelectedIcon : MarkerIcon;

  return (
    <View ref={viewRef} collapsable={false} style={{ width: 38, height: 52 }}>
      <PinIcon width={38} height={52} />
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
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 28, height: 28 }}
            resizeMode="cover"
            onLoad={() => {
              // Wait for the next paint frame before signalling ready.
              // onLoad fires when RN has the image data, but Android still
              // needs one more frame to composite it into the native View.
              // Capturing before that frame produces a blank circle.
              requestAnimationFrame(() => setImageReady(true));
            }}
            onError={() => {
              // Image URL failed — show fallback icon and still capture the view.
              setImageError(true);
              setImageReady(true);
            }}
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
            <Ionicons name="restaurant" size={14} color={COLORS.primary} />
          </View>
        )}
      </View>
    </View>
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
      <Text className="text-sm font-bold text-gray-700" numberOfLines={1}>
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

// ── Android SymbolLayer style ──
// On Android, MarkerView/PointAnnotation are unreliable (drift, broken bitmap
// capture with New Architecture). Instead we use a SymbolLayer with a static
// PNG icon for unselected markers (pure GL — perfect tracking & native press),
// and a single MarkerView only for the selected marker (ActivePill).
const ANDROID_SYMBOL_LAYER_ID = 'vendor-symbols-android';
const ANDROID_MARKER_IMAGE_KEY = 'vendor-marker-icon';
const ANDROID_MARKER_SELECTED_IMAGE_KEY = 'vendor-marker-selected-icon';

// Visibility is the inverse of the CircleLayer: show pin when dot is hidden.
// iconImage switches between orange (default) and green (selected) based on
// whether the feature's id matches the currently selected branch.
// selectedBranchId is injected at render time via buildAndroidSymbolStyle().
const buildAndroidSymbolStyle = (
  selectedId: string
): Record<string, unknown> => ({
  // Use per-vendor composite bitmap if available, else fallback to default pin.
  // Selected marker always uses the green pin (no composite needed — detail card
  // is visible so photo in pin is redundant).
  iconImage: [
    'case',
    ['==', ['get', 'id'], selectedId],
    // Selected: try green composite, fall back to static green pin
    [
      'coalesce',
      ['image', ['concat', 'marker-selected-', ['get', 'id']]],
      ['image', ANDROID_MARKER_SELECTED_IMAGE_KEY],
    ],
    // Unselected: try orange composite, fall back to static orange pin
    [
      'coalesce',
      ['image', ['concat', 'marker-', ['get', 'id']]],
      ['image', ANDROID_MARKER_IMAGE_KEY],
    ],
  ] as unknown as string,
  iconSize: [
    'case',
    ['==', ['get', 'id'], selectedId],
    0.6, // selected: slightly larger (2× bitmap → 0.5 base, +0.1 for emphasis)
    0.5, // bitmap is 2× logical size (76×104px), so 0.5 = 38×52dp on screen
  ] as unknown as number,
  iconAnchor: 'bottom' as const,
  iconAllowOverlap: true,
  iconOpacity: [
    'step',
    ['zoom'],
    // z < 13: only P1
    ['match', ['get', 'priority'], 1, 1, 0],
    13,
    // 13 ≤ z < 15: P1 + P2
    ['match', ['get', 'priority'], 1, 1, 2, 1, 0],
    15,
    // z ≥ 15: all
    1,
  ] as unknown as number,
});

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
  /** When true: shows a draggable center pin so the user can pick a location */
  isPickingLocation?: boolean;
  /** Fixed pin shown at the last explicitly-searched coordinate */
  searchCenter?: [number, number] | null;
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
  isPickingLocation = false,
  searchCenter = null,
}: MapsProps): JSX.Element => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapViewRef>(null);
  const initialCameraSettingsRef = useRef({
    centerCoordinate: initialCenter,
    zoomLevel: DEFAULT_ZOOM,
  });
  const userLocationRef = useRef<[number, number] | null>(null);
  const locateMeNeutralizeTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [isPickingDragging, setIsPickingDragging] = useState(false);

  // ── Android: composite marker bitmaps (pin + vendor photo) ──
  const [androidMarkerImages, setAndroidMarkerImages] = useState<
    Record<string, { uri: string }>
  >({});
  const capturedIdsRef = useRef<Set<string>>(new Set());
  const pendingCapturesRef = useRef<Record<string, { uri: string }>>({});
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMarkerBitmapCapture = useCallback((key: string, uri: string) => {
    if (capturedIdsRef.current.has(key)) return;
    capturedIdsRef.current.add(key);
    pendingCapturesRef.current[key] = { uri };

    // Batch updates to avoid excessive re-renders
    flushTimerRef.current ??= setTimeout(() => {
      flushTimerRef.current = null;
      setAndroidMarkerImages((prev) => ({
        ...prev,
        ...pendingCapturesRef.current,
      }));
      pendingCapturesRef.current = {};
    }, 200);
  }, []);

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

    if (locateMeNeutralizeTimer.current) {
      clearTimeout(locateMeNeutralizeTimer.current);
    }

    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 15,
      pitch: 0,
      animationDuration: 800,
      animationMode: 'easeTo',
    });

    // Android: neutralise the committed native camera target once the
    // animation finishes so a subsequent picking-mode drag doesn't snap back.
    if (Platform.OS === 'android') {
      locateMeNeutralizeTimer.current = setTimeout(() => {
        locateMeNeutralizeTimer.current = null;
        cameraRef.current?.setCamera({ animationDuration: 0 });
      }, 850);
    }
  }, [cameraRef]);

  // ── Drag → peek / picking drag state ──
  const handleRegionWillChange = useCallback(
    (feature: RegionPayloadFeature) => {
      console.log('[DEBUG Maps] handleRegionWillChange', {
        isUserInteraction: feature.properties.isUserInteraction,
        selectedBranchId,
      });
      if (feature.properties.isUserInteraction) {
        if (selectedBranchId) onUserDrag?.();
        if (isPickingLocation) setIsPickingDragging(true);
      }
    },
    [selectedBranchId, onUserDrag, isPickingLocation]
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
      console.log('[DEBUG Maps] handleRegionDidChange', {
        isUserInteraction: feature.properties.isUserInteraction,
        zoomLevel: feature.properties.zoomLevel.toFixed(2),
      });
      updateZoomBucket(feature.properties.zoomLevel);

      // Report visible center to parent when user interaction ends
      if (feature.properties.isUserInteraction) {
        if (isPickingLocation) setIsPickingDragging(false);
        const bounds = feature.properties.visibleBounds;
        if (bounds?.[0] && bounds?.[1]) {
          const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
          const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
          console.log('[DEBUG Maps] onMapIdle center:', [centerLng, centerLat]);
          onMapIdle?.([centerLng, centerLat]);
        }
      }
    },
    [updateZoomBucket, onMapIdle, isPickingLocation]
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
          defaultSettings={initialCameraSettingsRef.current}
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
              <FillExtrusionLayer
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

        {/* Android: register marker PNGs + composite bitmaps for SymbolLayer */}
        {Platform.OS === 'android' && (
          <Images
            images={{
              [ANDROID_MARKER_IMAGE_KEY]: markerPng,
              [ANDROID_MARKER_SELECTED_IMAGE_KEY]: markerSelectedPng,
              ...androidMarkerImages,
            }}
          />
        )}

        {/* Semantic Zoom — CircleLayer dots at low zoom */}
        <ShapeSource
          id={SOURCE_ID}
          shape={branchGeoJSON}
          onPress={handleSourcePress}
          hitbox={{ width: 44, height: 44 }}
        >
          <CircleLayer id={CIRCLE_LAYER_ID} style={CIRCLE_STYLE} />

          {/* Android: SymbolLayer-only rendering. Pure GL — perfect camera
              tracking + native press via ShapeSource.onPress. Selected marker
              renders as a green pin (larger), unselected as orange. */}
          {Platform.OS === 'android' && (
            <SymbolLayer
              id={ANDROID_SYMBOL_LAYER_ID}
              filter={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['==', ['get', 'isVerified'], true] as any
              }
              style={buildAndroidSymbolStyle(
                selectedBranchId ? String(selectedBranchId) : ''
              )}
            />
          )}
        </ShapeSource>

        {/* ── Pill Markers (iOS only — Android uses SymbolLayer exclusively) ── */}
        {Platform.OS !== 'android' &&
          visibleMarkers.map((marker) => {
            const isSelected = marker.branchId === selectedBranchId;
            return (
              <MarkerView
                key={marker.branchId}
                coordinate={marker.coordinate}
                anchor={{ x: 0.5, y: 1 }}
                allowOverlap
              >
                {isSelected ? (
                  <VendorMarker imageUrl={marker.imageUrl} isSelected />
                ) : (
                  <Pressable onPress={() => onMarkerPress(marker.branchId)}>
                    <VendorMarker imageUrl={marker.imageUrl} />
                  </Pressable>
                )}
              </MarkerView>
            );
          })}

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

        {/* Search-center pin — shown after an explicit text/pick search */}
        {searchCenter && !isPickingLocation && (
          <MarkerView
            coordinate={searchCenter}
            anchor={{ x: 0.5, y: 1 }}
            allowOverlap
          >
            <View style={{ width: 40, height: 48, alignItems: 'center' }}>
              <Ionicons
                name="location-sharp"
                size={40}
                color={COLORS.primary}
                style={{
                  textShadowColor: 'rgba(0,0,0,0.25)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              />
            </View>
          </MarkerView>
        )}
      </MapView>

      {/* Android: hidden offscreen views for bitmap capture */}
      {Platform.OS === 'android' && (
        <View
          style={{
            position: 'absolute',
            // Use transform instead of left/top offset so Android's view
            // system still considers this view "on-screen" and fully renders
            // its Image children. With left: -9999 Android skips compositing
            // images that are outside the viewport, causing captureRef to
            // capture a blank circle even though onLoad already fired.
            transform: [{ translateX: -10000 }],
          }}
          pointerEvents="none"
        >
          {visibleMarkers.flatMap((marker) => {
            const items: JSX.Element[] = [];
            // Orange (unselected) composite
            if (!capturedIdsRef.current.has(`marker-${marker.branchId}`)) {
              items.push(
                <MarkerBitmapItem
                  key={`orange-${marker.branchId}`}
                  branchId={marker.branchId}
                  imageUrl={marker.imageUrl}
                  onCapture={handleMarkerBitmapCapture}
                />
              );
            }
            // Green (selected) composite
            if (
              !capturedIdsRef.current.has(`marker-selected-${marker.branchId}`)
            ) {
              items.push(
                <MarkerBitmapItem
                  key={`green-${marker.branchId}`}
                  branchId={marker.branchId}
                  imageUrl={marker.imageUrl}
                  isSelected
                  onCapture={handleMarkerBitmapCapture}
                />
              );
            }
            return items;
          })}
        </View>
      )}

      {/* ── Center pin (picking mode) ── */}
      {isPickingLocation && (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <View style={{ marginBottom: 40 }}>
            <Ionicons
              name="location-sharp"
              size={52}
              color={COLORS.primary}
              style={{
                textShadowColor: 'rgba(0,0,0,0.25)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            />
          </View>
        </View>
      )}

      {/* ── Drag hint toast (picking mode) ── */}
      {isPickingLocation && !isPickingDragging && (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 items-center"
          style={{ bottom: 240 }}
        >
          <View className="rounded-full bg-black/60 px-4 py-2">
            <Text className="text-sm font-medium text-white">
              {t('map.drag_to_pick')}
            </Text>
          </View>
        </View>
      )}

      {/* Locate Me FAB — hidden in picking mode */}
      <Animated.View
        className="absolute right-4 top-52"
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
