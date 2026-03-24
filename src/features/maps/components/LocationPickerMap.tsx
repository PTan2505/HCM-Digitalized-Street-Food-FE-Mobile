import { Ionicons } from '@expo/vector-icons';
import {
  getPlaceDetail,
  reverseGeocode,
  searchAddress,
  type AutocompletePrediction,
} from '@features/maps/services/geocoding';
import {
  Camera,
  FillExtrusionLayer,
  LineLayer,
  Logger,
  MapView,
  SymbolLayer,
  UserLocation,
  setAccessToken,
  type CameraRef,
  type MapViewRef,
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React, {
  JSX,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Config ──
setAccessToken(null);

// Suppress 429 rate-limit errors from the tile server so they don't pollute the console.
// Returning `true` from the callback tells MapLibre's Logger to skip default console.error.
Logger.setLogCallback((log) => {
  if (log.level === 'error' && log.message?.includes('status code 429')) {
    return true; // swallow — tile will be retried automatically
  }
  return false; // let all other logs pass through normally
});

const HCMC_CENTER: [number, number] = [106.6297, 10.8231];
const DEFAULT_ZOOM = 16;

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
  'place-suburb',
  'place-village',
  'place-town',
  'place-other',
] as const;

const HIDDEN_BUILDING_LAYERS = ['building'] as const;

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

// ── Types ──
export interface PickedLocation {
  coordinate: [number, number]; // [lng, lat]
  address: string;
  addressDetail?: string;
  ward?: string;
  city?: string;
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

interface MapLibreLocation {
  coords: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationPickerMapRef {
  getLocation: () => PickedLocation | null;
}

interface LocationPickerMapProps {
  /** Initial coordinate to center on [lng, lat]. Defaults to HCMC center. */
  initialCoordinate?: [number, number];
  /** Called whenever the picked location changes */
  onLocationChange?: (location: PickedLocation) => void;
  /** Called when user presses the confirm button */
  onConfirm?: (location: PickedLocation) => void;
  /** Called when user presses back */
  onBack?: () => void;
}

// ── Debounce utility ──
const useDebouncedValue = <T,>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return (): void => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};

// ── Wrapper: resolve user location before rendering the map ──
export const LocationPickerMap = React.forwardRef<
  LocationPickerMapRef,
  LocationPickerMapProps
>(function LocationPickerMapWrapper(props, ref): JSX.Element {
  const [resolvedCoord, setResolvedCoord] = useState<[number, number] | null>(
    props.initialCoordinate ?? null
  );

  useEffect(() => {
    // If an explicit initialCoordinate was provided, use it directly
    if (props.initialCoordinate) return;

    void (async (): Promise<void> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          setResolvedCoord(HCMC_CENTER);
          return;
        }

        // Try cached position first (instant)
        const cached = await Location.getLastKnownPositionAsync();
        if (cached) {
          setResolvedCoord([cached.coords.longitude, cached.coords.latitude]);
          return;
        }

        // No cache — actively get current position (with timeout)
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setResolvedCoord([current.coords.longitude, current.coords.latitude]);
      } catch {
        setResolvedCoord(HCMC_CENTER);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!resolvedCoord) {
    // Brief loading state while resolving user location (typically <50ms)
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#a1d973" />
      </View>
    );
  }

  return (
    <LocationPickerMapInner
      {...props}
      ref={ref}
      initialCoordinate={resolvedCoord}
    />
  );
});

// ── Inner Component (map always renders with a known coordinate) ──
const LocationPickerMapInner = React.forwardRef<
  LocationPickerMapRef,
  LocationPickerMapProps & { initialCoordinate: [number, number] }
>(function LocationPickerMapInner(
  { initialCoordinate, onLocationChange, onConfirm, onBack },
  ref
): JSX.Element {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const mapRef = useRef<MapViewRef>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const hasCenteredOnUser = useRef(false);

  const startCoord = initialCoordinate;

  const [styleLoaded, setStyleLoaded] = useState(false);
  const [centerCoord, setCenterCoord] = useState<[number, number]>(startCoord);
  const centerCoordRef = useRef<[number, number]>(startCoord);
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [ward, setWard] = useState('');
  const [city, setCity] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const justSelectedRef = useRef(false);

  const debouncedSearch = useDebouncedValue(searchText, 350);

  // Expose getLocation to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      getLocation: (): PickedLocation | null => ({
        coordinate: centerCoord,
        address,
      }),
    }),
    [centerCoord, address]
  );

  // ── Autocomplete search ──
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSuggestions([]);
      return;
    }

    // Skip re-fetch if a suggestion was just selected
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    let cancelled = false;
    const doSearch = async (): Promise<void> => {
      setIsSearching(true);
      const results = await searchAddress(debouncedSearch, {
        lat: centerCoord[1],
        lng: centerCoord[0],
      });
      if (!cancelled) {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsSearching(false);
      }
    };
    void doSearch();
    return (): void => {
      cancelled = true;
    };
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reverse geocode on drag end ──
  const reverseGeocodeCenter = useCallback(
    async (coord: [number, number]): Promise<void> => {
      setIsReverseGeocoding(true);
      const reversed = await reverseGeocode(coord[1], coord[0]);
      if (reversed) {
        setAddress(reversed.formattedAddress);
        const detail = await getPlaceDetail(reversed.placeId);
        if (detail) {
          setAddressDetail(detail.addressDetail);
          setWard(detail.ward);
          setCity(detail.city);
          onLocationChange?.({
            coordinate: coord,
            address: reversed.formattedAddress,
            addressDetail: detail.addressDetail,
            ward: detail.ward,
            city: detail.city,
          });
        } else {
          setAddressDetail('');
          setWard('');
          setCity('');
          onLocationChange?.({
            coordinate: coord,
            address: reversed.formattedAddress,
          });
        }
      } else {
        const fallback = `${coord[1].toFixed(6)}, ${coord[0].toFixed(6)}`;
        setAddress(fallback);
        setAddressDetail('');
        setWard('');
        setCity('');
        onLocationChange?.({ coordinate: coord, address: fallback });
      }
      setIsReverseGeocoding(false);
    },
    [onLocationChange]
  );

  // Initial reverse geocode (coordinate is already resolved by wrapper)
  useEffect(() => {
    void reverseGeocodeCenter(startCoord);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Select autocomplete suggestion ──
  const handleSelectSuggestion = useCallback(
    async (prediction: AutocompletePrediction): Promise<void> => {
      Keyboard.dismiss();
      justSelectedRef.current = true;
      setSearchText(prediction.description);
      setShowSuggestions(false);
      setSuggestions([]);

      // Use Place Detail API for exact coordinates from place_id
      const detail = await getPlaceDetail(prediction.placeId);
      console.log(detail);

      if (detail) {
        const coord: [number, number] = [detail.lng, detail.lat];

        // Far destinations: stepped camera to avoid 429 rate-limit from tile bursts
        // Strategy: zoom out → teleport at low zoom → zoom in (spreads tile requests)
        const prev = centerCoordRef.current;
        const dLat = Math.abs(coord[1] - prev[1]);
        const dLng = Math.abs(coord[0] - prev[0]);

        setCenterCoord(coord);
        centerCoordRef.current = coord;
        setAddress(detail.formattedAddress);
        setAddressDetail(detail.addressDetail);
        setWard(detail.ward);
        setCity(detail.city);
        onLocationChange?.({
          coordinate: coord,
          address: detail.formattedAddress,
          addressDetail: detail.addressDetail,
          ward: detail.ward,
          city: detail.city,
        });
        const isFar = dLat > 0.05 || dLng > 0.05; // ~5 km threshold

        cameraRef.current?.setCamera({
          centerCoordinate: coord,
          zoomLevel: 17,
          animationDuration: isFar ? 1500 : 800,
          animationMode: isFar ? 'flyTo' : 'easeTo',
        });
      }
    },
    [onLocationChange]
  );

  // ── User location ── (center on first GPS fix, like Maps.tsx)
  const handleUserLocationUpdate = useCallback(
    (location: MapLibreLocation) => {
      userLocationRef.current = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      if (!hasCenteredOnUser.current) {
        hasCenteredOnUser.current = true;
        const coord: [number, number] = [
          location.coords.longitude,
          location.coords.latitude,
        ];
        setCenterCoord(coord);
        centerCoordRef.current = coord;

        cameraRef.current?.setCamera({
          centerCoordinate: coord,
          zoomLevel: DEFAULT_ZOOM,
          animationDuration: 1000,
          animationMode: 'easeTo',
        });

        // Reverse geocode the user's actual location
        void reverseGeocodeCenter(coord);
      }
    },
    [reverseGeocodeCenter]
  );

  // ── Locate me ──
  const handleLocateMe = useCallback(() => {
    const coords = userLocationRef.current;
    if (!coords) return;

    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 17,
      animationDuration: 800,
      animationMode: 'easeTo',
    });
  }, []);

  // ── Map drag tracking ──
  const handleRegionWillChange = useCallback(
    (feature: RegionPayloadFeature) => {
      if (feature.properties.isUserInteraction) {
        setIsDragging(true);
      }
    },
    []
  );

  const handleRegionDidChange = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const center = await mapRef.current.getCenter();
      const coord: [number, number] = [center[0], center[1]];
      setCenterCoord(coord);
      centerCoordRef.current = coord;

      if (isDragging) {
        setIsDragging(false);
        void reverseGeocodeCenter(coord);
      }
    } catch {
      // Map might not be ready
    }
  }, [isDragging, reverseGeocodeCenter]);

  // ── Confirm ──
  const handleConfirm = useCallback(() => {
    onConfirm?.({
      coordinate: centerCoord,
      address,
      addressDetail,
      ward,
      city,
    });
  }, [centerCoord, address, addressDetail, ward, city, onConfirm]);

  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        mapStyle={OPENMAP_VN_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingStyle={() => setStyleLoaded(true)}
        onRegionWillChange={handleRegionWillChange}
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: startCoord,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />

        <UserLocation visible onUpdate={handleUserLocationUpdate} />

        {/* Hide unwanted layers */}
        {styleLoaded && (
          <>
            {HIDDEN_SYMBOL_LAYERS.map((id) => (
              <SymbolLayer key={id} id={id} style={{ visibility: 'none' }} />
            ))}
            {HIDDEN_BUILDING_LAYERS.map((id) => (
              <FillExtrusionLayer
                key={id}
                id={id}
                style={{ visibility: 'none' }}
              />
            ))}
            {FADED_CASING_LAYERS.map((id) => (
              <LineLayer
                key={id}
                id={id}
                style={{ lineColor: '#e0e0e0', lineOpacity: 0.6 }}
              />
            ))}
            {FADED_ROAD_LAYERS.map((id) => (
              <LineLayer
                key={id}
                id={id}
                style={{ lineColor: '#ffffff', lineOpacity: 0.7 }}
              />
            ))}
          </>
        )}
      </MapView>

      {/* ── Center Pin (always dead-center, not a MarkerView) ── */}
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
      >
        {/* Offset the pin so the tip sits at center */}
        <View style={{ marginBottom: 40 }}>
          <Ionicons
            name="location-sharp"
            size={48}
            color="#a1d973"
            style={{
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          />
        </View>
      </View>

      {/* ── Dragging indicator ── */}
      {isDragging && (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 items-center"
          style={{ bottom: 120 }}
        >
          <View className="rounded-full bg-black/60 px-3 py-1.5">
            <Text className="text-xs font-medium text-white">
              Kéo bản đồ để chọn vị trí
            </Text>
          </View>
        </View>
      )}

      {/* ── Search Bar + Suggestions ── */}
      <View className="absolute left-4 right-4" style={{ top: insets.top + 8 }}>
        {/* Back button + Search input */}
        <View className="flex-row items-center rounded-2xl bg-white px-3 py-1 shadow-lg">
          {onBack && (
            <Pressable onPress={onBack} className="mr-2 p-1">
              <Ionicons name="arrow-back" size={22} color="#333" />
            </Pressable>
          )}
          <Ionicons
            name="search"
            size={18}
            color="#9ca3af"
            style={{ marginRight: 8 }}
          />
          <TextInput
            className="flex-1 py-2.5 text-sm text-gray-800"
            placeholder="Tìm địa chỉ..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (text.trim()) setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator size="small" color="#a1d973" />}
          {searchText.length > 0 && !isSearching && (
            <Pressable
              onPress={() => {
                setSearchText('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="p-1"
            >
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View className="mt-1 max-h-60 overflow-hidden rounded-xl bg-white shadow-lg">
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => void handleSelectSuggestion(item)}
                  className="flex-row items-center border-b border-gray-100 px-4 py-3 active:bg-gray-50"
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#a1d973"
                    style={{ marginRight: 10 }}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium text-gray-800"
                      numberOfLines={1}
                    >
                      {item.mainText}
                    </Text>
                    {item.secondaryText ? (
                      <Text
                        className="mt-0.5 text-xs text-gray-500"
                        numberOfLines={1}
                      >
                        {item.secondaryText}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}
      </View>

      {/* ── Bottom Card: Address + Confirm ── */}
      <View
        className="absolute left-0 right-0 rounded-t-3xl bg-white px-5 shadow-2xl"
        style={{ bottom: 0, paddingBottom: insets.bottom + 8 }}
      >
        {/* Handle bar */}
        <View className="mb-2 mt-3 items-center">
          <View className="h-1 w-10 rounded-full bg-gray-300" />
        </View>

        {/* Address display */}
        <View className="mb-4 flex-row items-start">
          <Ionicons
            name="location-sharp"
            size={20}
            color="#a1d973"
            style={{ marginTop: 2, marginRight: 8 }}
          />
          <View className="flex-1">
            <Text className="text-xs font-medium text-gray-400">
              Vị trí đã chọn
            </Text>
            {isReverseGeocoding ? (
              <View className="mt-1 flex-row items-center">
                <ActivityIndicator size="small" color="#a1d973" />
                <Text className="ml-2 text-sm text-gray-400">
                  Đang tìm địa chỉ...
                </Text>
              </View>
            ) : (
              <Text
                className="mt-0.5 text-sm leading-5 text-gray-800"
                numberOfLines={2}
              >
                {address || 'Kéo bản đồ để chọn vị trí'}
              </Text>
            )}
          </View>
        </View>

        {/* Coordinate chip */}
        <View className="mb-4 flex-row">
          <View className="flex-row items-center rounded-full bg-gray-100 px-3 py-1">
            <Ionicons
              name="navigate"
              size={12}
              color="#6b7280"
              style={{ marginRight: 4 }}
            />
            <Text className="text-xs text-gray-500">
              {centerCoord[1].toFixed(6)}, {centerCoord[0].toFixed(6)}
            </Text>
          </View>
        </View>

        {/* Confirm button */}
        <Pressable
          onPress={handleConfirm}
          disabled={isReverseGeocoding}
          className={`items-center rounded-xl py-3.5 ${
            isReverseGeocoding
              ? 'bg-gray-300'
              : 'bg-[#a1d973] active:bg-[#8fc75f]'
          }`}
        >
          <Text className="text-base font-bold text-white">
            Xác nhận vị trí
          </Text>
        </Pressable>
      </View>

      {/* ── Locate Me FAB ── */}
      <View
        className="absolute right-4"
        style={{ bottom: Platform.OS === 'ios' ? 220 + insets.bottom : 220 }}
      >
        <Pressable
          onPress={handleLocateMe}
          className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg active:bg-gray-100"
        >
          <Ionicons name="navigate" size={22} color="#a1d973" />
        </Pressable>
      </View>
    </View>
  );
});
