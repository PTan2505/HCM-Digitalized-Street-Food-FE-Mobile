import markerSelectedPng from '@assets/icons/marker-selected.png';
import MarkerSelectedIcon from '@assets/icons/marker-selected.svg';
import markerPng from '@assets/icons/marker.png';
import MarkerIcon from '@assets/icons/marker.svg';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { GhostPinResponse } from '@features/customer/maps/api/ghostPinApi';
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

// OpenMap Vietnam doesn't require an access token
setAccessToken(null);

// Silence 429 tile-server errors from the map logger
Logger.setLogCallback((log) => {
  if (log.level === 'error' && log.message?.includes('status code 429')) {
    return true;
  }
  return false;
});

const DEFAULT_ZOOM = 14;

/** Bottom padding applied when the detail card is open (~300pt tall). */
export const CAMERA_BOTTOM_PADDING = 320;

const OPENMAP_VN_STYLE = `${
  process.env.EXPO_PUBLIC_OPENMAP_VN_STYLE ??
  'https://maptiles.openmap.vn/styles/day-v1/style.json'
}?apikey=${process.env.EXPO_PUBLIC_OPENMAP_API_KEY}`;

// Base-style layers we want to hide entirely
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
  'place-suburb',
  'place-village',
  'place-town',
  'place-other',
] as const;

const HIDDEN_BUILDING_LAYERS = ['building'] as const;

// Road/tunnel/bridge casing layers — faded to reduce visual noise
const FADED_CASING_LAYERS = [
  'tunnel-service-track-casing',
  'tunnel-minor-casing',
  'tunnel-secondary-tertiary-casing',
  'tunnel-trunk-primary-casing',
  'tunnel-motorway-casing',
  'highway-motorway-link-casing',
  'highway-link-casing',
  'highway-minor-casing',
  'highway-minor-casing-service',
  'highway-trunk-casing',
  'highway-secondary-tertiary-casing',
  'highway-primary-casing',
  'highway-motorway-casing',
  'bridge-link-casing',
  'bridge-secondary-tertiary-casing',
  'bridge-trunk-primary-casing',
  'bridge-motorway-casing',
  'bridge-path-casing',
] as const;

// Road/tunnel/bridge fill layers — faded to reduce visual noise
const FADED_ROAD_LAYERS = [
  'tunnel-service-track',
  'tunnel-minor',
  'tunnel-secondary-tertiary',
  'tunnel-trunk-primary',
  'tunnel-motorway',
  'tunnel-path',
  'highway-motorway-link',
  'highway-link',
  'highway-minor-service',
  'highway-minor',
  'highway-secondary-tertiary',
  'highway-trunk',
  'highway-primary',
  'highway-motorway',
  'highway-path',
  'bridge-link',
  'bridge-secondary-tertiary',
  'bridge-trunk-primary',
  'bridge-path',
] as const;

// Maps finalScore (0–1) to a display priority: 1 = high, 2 = medium, 3 = low
const scoreToPriority = (finalScore: number): number => {
  if (finalScore >= 0.7) return 1;
  if (finalScore >= 0.3) return 2;
  return 3;
};

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
      name: b.vendorName?.length ? b.vendorName : b.name,
      priority: scoreToPriority(b.finalScore),
      rating: b.avgRating,
      isActive: b.isActive,
      isVerified: b.isVerified,
    },
  })),
});

const SOURCE_ID = 'vendor-source';
const CIRCLE_LAYER_ID = 'vendor-dots';

// Zoom levels at which medium/low priority markers become visible
const ZOOM_THRESHOLD_STANDARD = 13;
const ZOOM_THRESHOLD_BASIC = 15;

const shouldShowFullMarker = (priority: number, zoom: number): boolean => {
  if (priority === 1) return true;
  if (priority === 2) return zoom >= ZOOM_THRESHOLD_STANDARD;
  return zoom >= ZOOM_THRESHOLD_BASIC;
};

// Dot shown at low zoom; hides automatically when the full pin appears
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
    '#9CA3AF', // unverified → gray
    COLORS.primary,
  ] as unknown as string,
  circleStrokeWidth: 2,
  circleStrokeColor: '#ffffff',

  // Hide dot once the full marker (pin) is visible for that priority tier
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

// ── VendorMarker (iOS) ──
// Rendered directly as a React Native view inside a MapLibre MarkerView.

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

// ── MarkerBitmapItem (Android only) ──
// Android's SymbolLayer can only show pre-registered static images, not live
// React Native views. So for each branch we render a hidden VendorMarker,
// snapshot it as a PNG via react-native-view-shot, then register the PNG with
// the MapLibre Images component so the SymbolLayer can use it.

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
  // false until the image has loaded (or errored), then true to allow capture
  const [imageReady, setImageReady] = useState(!imageUrl);
  const [imageError, setImageError] = useState(false);
  // incrementing this re-triggers the capture effect on failure
  const [retryCount, setRetryCount] = useState(0);
  const captureSucceeded = useRef(false);

  const captureKey = isSelected
    ? `marker-selected-${branchId}`
    : `marker-${branchId}`;

  useEffect(() => {
    if (!imageReady || captureSucceeded.current) return;

    // Delay increases with each retry to give the native view more time to paint
    const delay = 120 + retryCount * 150;
    const timer = setTimeout(async () => {
      try {
        if (!viewRef.current) return;
        const uri = await captureRef(viewRef, {
          format: 'png',
          quality: 1,
          // Fixed 2× size (76×104px) so the bitmap is device-independent.
          // SymbolLayer iconSize: 0.5 maps this back to 38×52dp on screen.
          width: 76,
          height: 104,
        });
        captureSucceeded.current = true;
        onCapture(captureKey, uri);
      } catch {
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
              // Wait one frame so Android composites the image into the native
              // view before we snapshot it — otherwise we get a blank circle.
              requestAnimationFrame(() => setImageReady(true));
            }}
            onError={() => {
              // Show the fallback icon and proceed with capture anyway
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

// ── GhostPinCallout ──

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

// ── Android SymbolLayer ──
// On Android, MarkerView drifts and breaks with the New Architecture, so we
// use a GL SymbolLayer instead. It renders all pins natively and handles press
// via ShapeSource.onPress — no React Native views on the map at all.

const ANDROID_SYMBOL_LAYER_ID = 'vendor-symbols-android';
const ANDROID_MARKER_IMAGE_KEY = 'vendor-marker-icon';
const ANDROID_MARKER_SELECTED_IMAGE_KEY = 'vendor-marker-selected-icon';

const buildAndroidSymbolStyle = (
  selectedId: string
): Record<string, unknown> => ({
  // Use the captured composite bitmap (pin + photo) if ready, else the static PNG
  iconImage: [
    'case',
    ['==', ['get', 'id'], selectedId],
    [
      'coalesce',
      ['image', ['concat', 'marker-selected-', ['get', 'id']]],
      ['image', ANDROID_MARKER_SELECTED_IMAGE_KEY],
    ],
    [
      'coalesce',
      ['image', ['concat', 'marker-', ['get', 'id']]],
      ['image', ANDROID_MARKER_IMAGE_KEY],
    ],
  ] as unknown as string,
  // Bitmap is captured at 2× (76×104px), so 0.5 = 38×52dp; selected is slightly larger
  iconSize: [
    'case',
    ['==', ['get', 'id'], selectedId],
    0.6,
    0.5,
  ] as unknown as number,
  iconAnchor: 'bottom' as const,
  iconAllowOverlap: true,
  // Match the same zoom-based visibility as CircleLayer
  iconOpacity: [
    'step',
    ['zoom'],
    ['match', ['get', 'priority'], 1, 1, 0],
    13,
    ['match', ['get', 'priority'], 1, 1, 2, 1, 0],
    15,
    1,
  ] as unknown as number,
});

// ── Maps component ──

interface MapsProps {
  cameraRef: React.RefObject<CameraRef | null>;
  initialCenter: [number, number];
  selectedBranchId: number | null;
  isPeeked: boolean;
  onMarkerPress: (branchId: number) => void;
  onUserDrag?: () => void;
  /** Called after the map stops moving with the visible center [lng, lat] */
  onMapIdle?: (center: [number, number]) => void;
  branches?: ActiveBranch[];
  branchImageMap?: Record<number, string[]>;
  ghostPins?: GhostPinResponse[];
  /** When true, shows a draggable center pin for location picking */
  isPickingLocation?: boolean;
  /** Dropped pin shown after an explicit address/text search */
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
  // Android: clears the native camera target after a setCamera animation so
  // dragging in picking mode doesn't snap back to the animation's destination
  const locateMeNeutralizeTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [isPickingDragging, setIsPickingDragging] = useState(false);

  // Android composite bitmaps: captured PNG per branch keyed by branchId
  const [androidMarkerImages, setAndroidMarkerImages] = useState<
    Record<string, { uri: string }>
  >({});
  const capturedIdsRef = useRef<Set<string>>(new Set());
  const pendingCapturesRef = useRef<Record<string, { uri: string }>>({});
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Batches multiple captures into a single state update
  const handleMarkerBitmapCapture = useCallback((key: string, uri: string) => {
    if (capturedIdsRef.current.has(key)) return;
    capturedIdsRef.current.add(key);
    pendingCapturesRef.current[key] = { uri };

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
        label: b.vendorName?.length ? b.vendorName : b.name,
        rating: b.avgRating,
        isVerified: b.isVerified,
        imageUrl: branchImageMap[b.branchId]?.[0],
      })),
    [branches, branchImageMap]
  );

  // FAB slides up/down when the detail card opens, peeks, or closes
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

    // Android: flush the native camera target after the animation so a
    // subsequent picking-mode drag doesn't snap back to this position
    if (Platform.OS === 'android') {
      locateMeNeutralizeTimer.current = setTimeout(() => {
        locateMeNeutralizeTimer.current = null;
        cameraRef.current?.setCamera({ animationDuration: 0 });
      }, 850);
    }
  }, [cameraRef]);

  const handleRegionWillChange = useCallback(
    (feature: RegionPayloadFeature) => {
      if (feature.properties.isUserInteraction) {
        if (selectedBranchId) onUserDrag?.();
        if (isPickingLocation) setIsPickingDragging(true);
      }
    },
    [selectedBranchId, onUserDrag, isPickingLocation]
  );

  // Zoom is throttled so MarkerView components don't mount/unmount too rapidly
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

      if (feature.properties.isUserInteraction) {
        if (isPickingLocation) setIsPickingDragging(false);
        const bounds = feature.properties.visibleBounds;
        if (bounds?.[0] && bounds?.[1]) {
          const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
          const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
          onMapIdle?.([centerLng, centerLat]);
        }
      }
    },
    [updateZoomBucket, onMapIdle, isPickingLocation]
  );

  const handleRegionIsChanging = useCallback(
    (feature: RegionPayloadFeature) => {
      updateZoomBucket(feature.properties.zoomLevel);
    },
    [updateZoomBucket]
  );

  // Only verified branches; selected branch is always included regardless of zoom
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

        {/* Override base-style layers once the style has loaded */}
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
                style={{ lineColor: '#e0e0e0', lineOpacity: 0.6 }}
              />
            ))}
            {FADED_ROAD_LAYERS.map((layerId) => (
              <LineLayer
                key={layerId}
                id={layerId}
                style={{ lineColor: '#ffffff', lineOpacity: 0.7 }}
              />
            ))}
          </>
        )}

        {/* Android: register the static fallback PNGs and captured composites */}
        {Platform.OS === 'android' && (
          <Images
            images={{
              [ANDROID_MARKER_IMAGE_KEY]: markerPng,
              [ANDROID_MARKER_SELECTED_IMAGE_KEY]: markerSelectedPng,
              ...androidMarkerImages,
            }}
          />
        )}

        {/* Dots at low zoom + pins at high zoom via CircleLayer / SymbolLayer */}
        <ShapeSource
          id={SOURCE_ID}
          shape={branchGeoJSON}
          onPress={handleSourcePress}
          hitbox={{ width: 44, height: 44 }}
        >
          <CircleLayer id={CIRCLE_LAYER_ID} style={CIRCLE_STYLE} />

          {/* Android pins — pure GL, no React Native views on the map */}
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

        {/* iOS pins — React Native views anchored to map coordinates */}
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

        {/* Unverified ghost pins with a status callout */}
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

        {/* Dropped pin after an address/text search */}
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

      {/* Android: off-screen views used to snapshot marker bitmaps.
          Uses transform (not left/top) so Android still renders the images —
          views far outside the viewport get skipped by Android's render system,
          producing blank snapshots. */}
      {Platform.OS === 'android' && (
        <View
          style={{ position: 'absolute', transform: [{ translateX: -10000 }] }}
          pointerEvents="none"
        >
          {visibleMarkers.flatMap((marker) => {
            const items: JSX.Element[] = [];
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

      {/* Center crosshair pin in picking mode */}
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

      {/* Drag hint toast — shown until the user starts dragging */}
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

      {/* Locate Me FAB */}
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
