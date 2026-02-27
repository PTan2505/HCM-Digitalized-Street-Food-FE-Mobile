import { Ionicons } from '@expo/vector-icons';
import MOCK_VENDORS from '@features/maps/constants/mockData';
import {
  Camera,
  CircleLayer,
  FillLayer,
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
import { Pressable, Text, View } from 'react-native';
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

const HCMC_CENTER: [number, number] = [106.6297, 10.8231];
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
] as const;

const HIDDEN_BUILDING_LAYERS = ['building'] as const;

// ── Priority Mapping ──
// 1 = Premium (always pill), 2 = Standard (pill at z≥13), 3 = Basic (pill at z≥15)
const tierToPriority = (tierId: string): number => {
  switch (tierId) {
    case 'tier_premium':
      return 1;
    case 'tier_standard':
      return 2;
    default:
      return 3;
  }
};

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

// ── GeoJSON FeatureCollection Builder ──
const buildVendorGeoJSON = (): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: MOCK_VENDORS.map((v) => ({
    type: 'Feature' as const,
    id: v.vendorId,
    geometry: {
      type: 'Point' as const,
      coordinates: [v.long, v.lat],
    },
    properties: {
      id: v.vendorId,
      name: v.name,
      priority: tierToPriority(v.tierId),
      price: tierToPrice(v.tierId),
      rating: v.avgRating,
      isActive: v.isActive,
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

const VENDOR_MARKERS = MOCK_VENDORS.map((v) => ({
  vendorId: v.vendorId,
  coordinate: [v.long, v.lat] as [number, number],
  priority: tierToPriority(v.tierId),
  label: tierToPrice(v.tierId),
  rating: v.avgRating,
}));

// ── CircleLayer Style (dot representation) ──
// Opacity per priority: P1 always hidden, P2 hidden at z≥13, P3 hidden at z≥15
const CIRCLE_STYLE = {
  circleRadius: [
    'interpolate',
    ['linear'],
    ['zoom'],
    10,
    5,
    14,
    8,
    18,
    10,
  ] as unknown as number,

  circleColor: '#a1d973',
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

// ── VendorMarker — unselected pill (white bg) ──
interface VendorMarkerProps {
  label: string;
  rating: number;
}

const VendorMarker = ({ label, rating }: VendorMarkerProps): JSX.Element => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
  }, [opacity]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={fadeStyle}>
      <View className="items-center">
        <View className="flex-row items-center rounded-full border border-gray-200 bg-white px-2.5 py-1.5 shadow-md">
          <Ionicons
            name="restaurant"
            size={12}
            color="#a1d973"
            style={{ marginRight: 4 }}
          />
          <Text className="text-xs font-bold text-gray-700" numberOfLines={1}>
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
            borderTopColor: '#fff',
            marginTop: -1,
          }}
        />
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

interface MapsProps {
  cameraRef: React.RefObject<CameraRef | null>;
  selectedVendorId: string | null;
  isPeeked: boolean;
  onMarkerPress: (vendorId: string) => void;
  onUserDrag?: () => void;
}

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
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const hasCenteredOnUser = useRef(false);

  const vendorGeoJSON = useMemo(() => buildVendorGeoJSON(), []);

  // ── FAB position ──
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

  // ── User location ──
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
      if (feature.properties.isUserInteraction && selectedVendorId) {
        onUserDrag?.();
      }
    },
    [selectedVendorId, onUserDrag]
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
    },
    [updateZoomBucket]
  );

  // ── Continuous zoom tracking during gestures ──
  const handleRegionIsChanging = useCallback(
    (feature: RegionPayloadFeature) => {
      updateZoomBucket(feature.properties.zoomLevel);
    },
    [updateZoomBucket]
  );

  // ── Visible pill markers (selected vendor always included) ──
  const visibleMarkers = useMemo(
    () =>
      VENDOR_MARKERS.filter(
        (v) =>
          v.vendorId === selectedVendorId ||
          shouldShowFullMarker(v.priority, zoomLevel)
      ),
    [zoomLevel, selectedVendorId]
  );

  // ── ShapeSource press → select vendor ──
  const handleSourcePress = useCallback(
    (event: {
      features: GeoJSON.Feature[];
      coordinates: { latitude: number; longitude: number };
      point: { x: number; y: number };
    }) => {
      const feature = event.features?.[0];
      const vendorId = feature?.properties?.id as string | undefined;
      if (vendorId) {
        onMarkerPress(vendorId);
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
            centerCoordinate: HCMC_CENTER,
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
          </>
        )}

        {/* Semantic Zoom — CircleLayer dots at low zoom */}
        <ShapeSource
          id={SOURCE_ID}
          shape={vendorGeoJSON}
          onPress={handleSourcePress}
          hitbox={{ width: 44, height: 44 }}
        >
          <CircleLayer id={CIRCLE_LAYER_ID} style={CIRCLE_STYLE} />
        </ShapeSource>

        {/* Pill Markers — content swaps between white/green pill */}
        {visibleMarkers.map((vendor) => (
          <MarkerView
            key={vendor.vendorId}
            coordinate={vendor.coordinate}
            anchor={{ x: 0.5, y: 1 }}
            allowOverlap
          >
            {vendor.vendorId === selectedVendorId ? (
              <ActivePill label={vendor.label} rating={vendor.rating} />
            ) : (
              <Pressable onPress={() => onMarkerPress(vendor.vendorId)}>
                <VendorMarker label={vendor.label} rating={vendor.rating} />
              </Pressable>
            )}
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
