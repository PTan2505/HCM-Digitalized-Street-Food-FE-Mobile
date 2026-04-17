import SearchBar from '@components/SearchBar';
import { COLORS } from '@constants/colors';
import type { FilterSection, FilterState } from '@custom-types/filter';
import { Ionicons } from '@expo/vector-icons';
import FilterModal from '@features/home/components/common/FilterModal';
import { useSearchHistory } from '@features/home/hooks/useSearchHistory';
import type { ActiveBranch } from '@features/home/types/branch';
import type { GhostPinResponse } from '@features/maps/api/ghostPinApi';
import { DetailCard } from '@features/maps/components/DetailCard';
import { MapBranchCard } from '@features/maps/components/MapBranchCard';
import { CAMERA_BOTTOM_PADDING, Maps } from '@features/maps/components/Maps';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import {
  type AutocompletePrediction,
  getPlaceDetail,
  reverseGeocode,
  searchAddress,
} from '@features/maps/services/geocoding';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { type CameraRef } from '@maplibre/maplibre-react-native';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  computeDisplayName,
  fetchActiveBranches,
  selectBranchImageMap,
  selectBranches,
  selectBranchesStatus,
  selectMultiBranchVendorIds,
  updateBranchRating,
} from '@slices/branches';
import { registerCallback } from '@utils/callbackRegistry';
import * as Location from 'expo-location';
import type { JSX } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };

// ---------------------------------------------------------------------------
// MapScreen
// ---------------------------------------------------------------------------
type MapScreenProps = StaticScreenProps<{
  initialBranch?: ActiveBranch;
}>;

export const MapScreen = ({ route }: MapScreenProps): JSX.Element => {
  const { initialBranch } = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const cameraRef = useRef<CameraRef>(null);
  const listRef = useRef<FlatList<ActiveBranch>>(null);
  const clearNativeTargetTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isPeeked, setIsPeeked] = useState(false);
  const { permissionStatus, retryPermission, coords } = useLocationPermission();

  // Map center for fetching — defaults to user location, updated by search
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(coords ? { lat: coords.latitude, lng: coords.longitude } : null);

  const userCenter = coords
    ? ([coords.longitude, coords.latitude] as [number, number])
    : null;

  // Branch data from Redux
  const branches = useAppSelector(selectBranches);
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const branchesStatus = useAppSelector(selectBranchesStatus);
  const multiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);

  // Ghost pins
  const [ghostPins] = useState<GhostPinResponse[]>([]);

  // Filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterSection, setFilterSection] = useState<FilterSection | null>(
    null
  );
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    distance: 5,
    dietaryTags: [],
    tasteTags: [],
    categoryIds: [],
    minPrice: 0,
    maxPrice: 5000000,
    spaceTypes: [],
    hasParking: false,
    openNow: false,
    amenities: [],
  });

  // Address history (separate storage key from SearchScreen's keyword history)
  const { history: addressHistory, addToHistory: addToAddressHistory } =
    useSearchHistory('@map_address_history');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAddressHistory = isSearchFocused && !searchText.trim();

  const pendingCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  // Search-center pin — coordinate of the last explicit text/pick search
  const [searchCenterCoord, setSearchCenterCoord] = useState<
    [number, number] | null
  >(null);

  // "Pick on map" mode
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickingAddress, setPickingAddress] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  // Ref so the onMapIdle callback always reads the latest value without re-creating
  const isPickingLocationRef = useRef(false);
  // Ref so handleSearchAroundUser always reads the freshest coords/filters
  const coordsRef = useRef(coords);
  coordsRef.current = coords;
  const activeFiltersRef = useRef(activeFilters);
  activeFiltersRef.current = activeFilters;

  // ── Bottom sheet snap points ──
  // Positions are translateY values from the top of the sheet's natural position.
  // 0 = fully expanded (sheet at ~30% from top), positive = pushed down.
  const SNAP_EXPANDED = 0;
  const SNAP_HALF = SCREEN_HEIGHT * 0.2; // half position
  const SNAP_COLLAPSED = SCREEN_HEIGHT * 0.42; // only ~100px peek visible

  const sheetTranslateY = useSharedValue(SNAP_COLLAPSED);
  const sheetContext = useSharedValue(0);

  const snapToNearest = useCallback(
    (velocityY: number) => {
      'worklet';
      const current = sheetTranslateY.value;
      const snaps = [SNAP_EXPANDED, SNAP_HALF, SNAP_COLLAPSED];

      // Strong velocity → snap in that direction
      if (velocityY < -500) {
        // Swiping up fast
        const above = snaps.filter((s) => s < current);
        sheetTranslateY.value = withSpring(
          above.length > 0 ? above[above.length - 1] : SNAP_EXPANDED,
          SPRING_CONFIG
        );
        return;
      }
      if (velocityY > 500) {
        // Swiping down fast
        const below = snaps.filter((s) => s > current);
        sheetTranslateY.value = withSpring(
          below.length > 0 ? below[0] : SNAP_COLLAPSED,
          SPRING_CONFIG
        );
        return;
      }

      // Otherwise snap to nearest
      let nearest = snaps[0];
      let minDist = Math.abs(current - snaps[0]);
      for (const snap of snaps) {
        const dist = Math.abs(current - snap);
        if (dist < minDist) {
          minDist = dist;
          nearest = snap;
        }
      }
      sheetTranslateY.value = withSpring(nearest, SPRING_CONFIG);
    },
    [SNAP_COLLAPSED, SNAP_EXPANDED, SNAP_HALF, sheetTranslateY]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      sheetContext.value = sheetTranslateY.value;
    })
    .onUpdate((e) => {
      const next = sheetContext.value + e.translationY;
      // Clamp between expanded and collapsed
      sheetTranslateY.value = Math.max(
        SNAP_EXPANDED,
        Math.min(SNAP_COLLAPSED, next)
      );
    })
    .onEnd((e) => {
      snapToNearest(e.velocityY);
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  // ── Fetch branches for a given center ──
  const fetchBranchesForLocation = useCallback(
    (lat: number, lng: number, filters?: FilterState | null) => {
      setMapCenter({ lat, lng });
      void dispatch(
        fetchActiveBranches({
          page: 1,
          lat,
          lng,
          distance: filters?.distance ?? 5,
          dietaryIds: filters?.dietaryTags
            ?.map(Number)
            .filter((n) => !isNaN(n) && n > 0),
          tasteIds: filters?.tasteTags
            ?.map(Number)
            .filter((n) => !isNaN(n) && n > 0),
          minPrice:
            filters?.minPrice !== undefined && filters.minPrice > 0
              ? filters.minPrice
              : undefined,
          maxPrice:
            filters?.maxPrice !== undefined && filters.maxPrice < 5000000
              ? filters.maxPrice
              : undefined,
          CategoryIds: filters?.categoryIds
            ?.map(Number)
            .filter((n) => !isNaN(n) && n > 0),
        })
      );
    },
    [dispatch]
  );

  // ── Filter apply handler ──
  const handleFilterApply = useCallback(
    (filters: FilterState) => {
      setActiveFilters(filters);
      setFilterModalVisible(false);
      if (mapCenter) {
        fetchBranchesForLocation(mapCenter.lat, mapCenter.lng, filters);
      }
    },
    [mapCenter, fetchBranchesForLocation]
  );

  // ── Initial fetch when coords become available ──
  const hasFetchedRef = useRef(false);
  React.useEffect(() => {
    if (hasFetchedRef.current) return;
    const center = initialBranch
      ? { latitude: initialBranch.lat, longitude: initialBranch.long }
      : coords;
    if (!center) return;
    hasFetchedRef.current = true;
    fetchBranchesForLocation(center.latitude, center.longitude);
  }, [coords, initialBranch, fetchBranchesForLocation]);

  // ── Search address autocomplete (debounced) ──
  const handleSearchTextChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (text.trim()) setShowPredictions(true);

      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (text.trim().length < 2) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }
      searchTimerRef.current = setTimeout(async () => {
        const results = await searchAddress(
          text,
          mapCenter ? { lat: mapCenter.lat, lng: mapCenter.lng } : undefined
        );
        setPredictions(results);
        setShowPredictions(results.length > 0);
      }, 350);
    },
    [mapCenter]
  );

  // ── Dismiss search on blur ──
  const dismissSearch = useCallback(() => {
    setShowPredictions(false);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  }, []);

  // ── Pick on map: enter picking mode ──
  const handlePickOnMap = useCallback(() => {
    setShowPredictions(false);
    setIsSearchFocused(false);
    Keyboard.dismiss();
    isPickingLocationRef.current = true;
    setIsPickingLocation(true);
    // Kick off an immediate reverse geocode for the current pending center
    const center = pendingCenterRef.current ?? mapCenter;
    if (center) {
      setIsReverseGeocoding(true);
      reverseGeocode(center.lat, center.lng)
        .then((result) => {
          setPickingAddress(
            result?.formattedAddress ??
              `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`
          );
        })
        .catch(() => {
          setPickingAddress(
            `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`
          );
        })
        .finally(() => setIsReverseGeocoding(false));
    }
  }, [mapCenter]);

  // ── Pick on map: confirm chosen location ──
  const handlePickingConfirm = useCallback(() => {
    const center = pendingCenterRef.current ?? mapCenter;
    if (!center) return;
    isPickingLocationRef.current = false;
    setIsPickingLocation(false);
    setSearchText(pickingAddress);
    if (pickingAddress) addToAddressHistory(pickingAddress);
    setSearchCenterCoord([center.lng, center.lat]);
    fetchBranchesForLocation(center.lat, center.lng, activeFilters);
    setPickingAddress('');
  }, [
    mapCenter,
    pickingAddress,
    addToAddressHistory,
    fetchBranchesForLocation,
    activeFilters,
  ]);

  // ── Pick on map: cancel ──
  const handlePickingCancel = useCallback(() => {
    isPickingLocationRef.current = false;
    setIsPickingLocation(false);
    setPickingAddress('');
    setIsReverseGeocoding(false);
  }, []);

  // ── Search around user: reset to user location ──
  const handleSearchAroundUser = useCallback(() => {
    const currentCoords = coordsRef.current;
    console.log('[SAU] called — coordsRef.current =', currentCoords);
    console.log('[SAU] cameraRef.current =', cameraRef.current);
    console.log(
      '[SAU] clearNativeTargetTimer pending =',
      clearNativeTargetTimer.current !== null
    );
    if (!currentCoords) {
      console.log('[SAU] early-return: no coords');
      return;
    }
    setSearchCenterCoord(null);
    setSearchText('');
    // Cancel any pending native camera target neutralisation so it doesn't
    // fight the new setCamera call (especially on Android).
    if (clearNativeTargetTimer.current) {
      console.log('[SAU] clearing pending native-target timer');
      clearTimeout(clearNativeTargetTimer.current);
      clearNativeTargetTimer.current = null;
    }
    const targetCoord = [currentCoords.longitude, currentCoords.latitude] as [
      number,
      number,
    ];

    // Step 1: pin the native camera at the current visible position with zero
    // animation, flushing any queued animation state (Android silently drops a
    // subsequent setCamera when a prior animation is still "committed").
    const currentNativeCenter = pendingCenterRef.current;
    if (currentNativeCenter) {
      console.log('[SAU] neutralise with current center', currentNativeCenter);
      cameraRef.current?.setCamera({
        centerCoordinate: [currentNativeCenter.lng, currentNativeCenter.lat],
        animationDuration: 0,
      });
    } else {
      console.log('[SAU] no pendingCenterRef — skipping neutralise');
    }

    // Step 2: after the neutralise has been processed (one frame), move to
    // user location.
    setTimeout(() => {
      console.log('[SAU] setTimeout fired — calling setCamera to', targetCoord);
      cameraRef.current?.setCamera({
        centerCoordinate: targetCoord,
        zoomLevel: 14,
        animationDuration: 800,
        animationMode: 'easeTo',
      });
      console.log('[SAU] setCamera dispatched');

      // Android: neutralise the native camera target once the animation
      // finishes so a subsequent picking-mode drag doesn't snap back here.
      // (Same pattern as onMarkerPress's clearNativeTargetTimer.)
      if (Platform.OS === 'android') {
        clearNativeTargetTimer.current = setTimeout(() => {
          clearNativeTargetTimer.current = null;
          cameraRef.current?.setCamera({ animationDuration: 0 });
        }, 850); // 800ms animation + 50ms safety margin
      }
    }, 32);

    fetchBranchesForLocation(
      currentCoords.latitude,
      currentCoords.longitude,
      activeFiltersRef.current
    );
  }, [fetchBranchesForLocation]);

  // ── Select a prediction → move camera & fetch branches ──
  const handleSelectPrediction = useCallback(
    async (prediction: AutocompletePrediction) => {
      setShowPredictions(false);
      setSearchText(prediction.mainText);
      setIsSearchFocused(false);
      Keyboard.dismiss();

      addToAddressHistory(prediction.mainText);

      const detail = await getPlaceDetail(prediction.placeId);
      if (!detail) return;

      const newCenter: [number, number] = [detail.lng, detail.lat];
      setSearchCenterCoord(newCenter);

      if (clearNativeTargetTimer.current) {
        clearTimeout(clearNativeTargetTimer.current);
      }
      cameraRef.current?.setCamera({
        centerCoordinate: newCenter,
        zoomLevel: 14,
        animationDuration: 800,
        animationMode: 'easeTo',
      });
      if (Platform.OS === 'android') {
        clearNativeTargetTimer.current = setTimeout(() => {
          clearNativeTargetTimer.current = null;
          cameraRef.current?.setCamera({ animationDuration: 0 });
        }, 850);
      }

      fetchBranchesForLocation(detail.lat, detail.lng);
    },
    [fetchBranchesForLocation, addToAddressHistory]
  );

  // ── Select a history address → search by address text ──
  const handleSelectAddressHistory = useCallback(
    (address: string) => {
      setSearchText(address);
      setIsSearchFocused(false);
      Keyboard.dismiss();
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(async () => {
        const results = await searchAddress(
          address,
          mapCenter ? { lat: mapCenter.lat, lng: mapCenter.lng } : undefined
        );
        if (results.length > 0) {
          const detail = await getPlaceDetail(results[0].placeId);
          if (!detail) return;
          const coord: [number, number] = [detail.lng, detail.lat];
          setSearchCenterCoord(coord);

          if (clearNativeTargetTimer.current) {
            clearTimeout(clearNativeTargetTimer.current);
          }
          cameraRef.current?.setCamera({
            centerCoordinate: coord,
            zoomLevel: 14,
            animationDuration: 800,
            animationMode: 'easeTo',
          });
          if (Platform.OS === 'android') {
            clearNativeTargetTimer.current = setTimeout(() => {
              clearNativeTargetTimer.current = null;
              cameraRef.current?.setCamera({ animationDuration: 0 });
            }, 850);
          }
          fetchBranchesForLocation(detail.lat, detail.lng);
        }
      }, 0);
    },
    [mapCenter, fetchBranchesForLocation]
  );

  // ── Helper: get displayName for a branch ──
  const getDisplayName = useCallback(
    (branch: ActiveBranch) => {
      const isMultiBranch = multiBranchVendorIds.includes(branch.vendorId);
      return computeDisplayName(branch, isMultiBranch, t('branch'));
    },
    [multiBranchVendorIds, t]
  );

  // ── Marker press handler ──
  const onMarkerPress = useCallback(
    (branchId: number) => {
      const branch = branches.find((b) => b.branchId === branchId);
      if (!branch) return;

      console.log('[DEBUG MapScreen] onMarkerPress → setCamera to', [
        branch.long,
        branch.lat,
      ]);
      dismissSearch();
      setSelectedBranchId(branchId);
      setIsPeeked(false);

      // Cancel any pending native target clear from a previous selection
      if (clearNativeTargetTimer.current) {
        clearTimeout(clearNativeTargetTimer.current);
      }

      cameraRef.current?.setCamera({
        centerCoordinate: [branch.long, branch.lat],
        animationDuration: 500,
        animationMode: 'easeTo',
        padding: {
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: CAMERA_BOTTOM_PADDING,
        },
      });

      // Android: after the animation completes, "neutralize" the native camera
      // target so it won't snap back to this position when the user drags.
      if (Platform.OS === 'android') {
        clearNativeTargetTimer.current = setTimeout(() => {
          clearNativeTargetTimer.current = null;
          console.log('[DEBUG MapScreen] Clearing native camera target');
          cameraRef.current?.setCamera({ animationDuration: 0 });
        }, 550);
      }
    },
    [branches, dismissSearch]
  );

  // ── Auto-select initialBranch once it appears in the fetched branches ──
  const hasAutoSelectedRef = useRef(false);
  React.useEffect(() => {
    if (!initialBranch || hasAutoSelectedRef.current) return;
    const found = branches.find((b) => b.branchId === initialBranch.branchId);
    if (!found) return;
    hasAutoSelectedRef.current = true;
    onMarkerPress(initialBranch.branchId);
  }, [initialBranch, branches, onMarkerPress]);

  // ── Detail card close ──
  const onCloseDetail = useCallback(() => {
    setSelectedBranchId(null);
    setIsPeeked(false);
  }, []);

  // ── Expand card back from peek ──
  const onExpand = useCallback(() => {
    setIsPeeked(false);
  }, []);

  // ── User drags map → peek card + dismiss search + collapse sheet ──
  const onUserDrag = useCallback(() => {
    if (selectedBranchId) {
      setIsPeeked(true);
    } else {
      sheetTranslateY.value = withSpring(SNAP_COLLAPSED, SPRING_CONFIG);
    }
    dismissSearch();
  }, [selectedBranchId, dismissSearch, sheetTranslateY, SNAP_COLLAPSED]);

  // ── Map stopped moving → reverse geocode (picking) or show search-area button ──
  const onMapIdle = useCallback((center: [number, number]) => {
    const [lng, lat] = center;
    pendingCenterRef.current = { lat, lng };

    if (isPickingLocationRef.current) {
      setIsReverseGeocoding(true);
      reverseGeocode(lat, lng)
        .then((result) => {
          if (!isPickingLocationRef.current) return; // cancelled
          setPickingAddress(
            result?.formattedAddress ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          );
        })
        .catch(() => {
          if (!isPickingLocationRef.current) return;
          setPickingAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        })
        .finally(() => {
          if (isPickingLocationRef.current) setIsReverseGeocoding(false);
        });
      return;
    }
  }, []);

  // ── Rating update callback ──
  const handleRatingUpdate = useCallback(
    (branchId: number, avgRating: number, totalReviewCount: number) => {
      dispatch(updateBranchRating({ branchId, avgRating, totalReviewCount }));
    },
    [dispatch]
  );

  // ── Navigate to RestaurantDetails from DetailCard ──
  const handleViewDetail = useCallback(
    (branch: ActiveBranch) => {
      navigation.navigate('RestaurantDetails', {
        branch,
        displayName: getDisplayName(branch),
        onRatingUpdateId: registerCallback((avgRating, totalReviewCount) =>
          handleRatingUpdate(branch.branchId, avgRating, totalReviewCount)
        ),
      });
    },
    [navigation, getDisplayName, handleRatingUpdate]
  );

  // ── Navigate to RestaurantSwipe from list card ──
  const handleBranchPress = useCallback(
    (branch: ActiveBranch) => {
      navigation.navigate('RestaurantSwipe', {
        branch,
        displayName: getDisplayName(branch),
        onRatingUpdateId: registerCallback((avgRating, totalReviewCount) =>
          handleRatingUpdate(branch.branchId, avgRating, totalReviewCount)
        ),
      });
    },
    [navigation, getDisplayName, handleRatingUpdate]
  );

  // ── Tap on list card → select on map + collapse sheet ──
  const handleListCardPress = useCallback(
    (branch: ActiveBranch) => {
      onMarkerPress(branch.branchId);
    },
    [onMarkerPress]
  );

  // ── Resolve selected branch ──
  const selectedBranch = selectedBranchId
    ? (branches.find((b) => b.branchId === selectedBranchId) ?? null)
    : null;

  // ── Permission states ──
  if (
    permissionStatus === Location.PermissionStatus.UNDETERMINED ||
    (permissionStatus === Location.PermissionStatus.GRANTED && !userCenter)
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
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
          className="rounded-lg bg-primary px-6 py-3"
          onPress={retryPermission}
        >
          <Text className="text-base font-semibold text-white">
            Cấp quyền truy cập
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Height of the sheet from the top of the screen when fully expanded
  const SHEET_TOP = SCREEN_HEIGHT * 0.3;

  return (
    <GestureHandlerRootView className="flex-1 bg-white">
      {/* ── Full-screen Map ── */}
      <View className="flex-1">
        {/* Search bar overlay at top — hidden while picking */}
        {!isPickingLocation && (
          <View
            style={{
              position: 'absolute',
              top: insets.top + 8,
              left: 12,
              right: 12,
              zIndex: 20,
            }}
          >
            <SearchBar
              placeholder={t('map.search_address_placeholder')}
              value={searchText}
              onChangeText={handleSearchTextChange}
              showBackButton
              onBackPress={() => navigation.goBack()}
              showFilterChipBar
              showFilterButton
              activeFilters={activeFilters}
              ignoreDefaultDistance
              onFilterPress={() => {
                setFilterSection(null);
                setFilterModalVisible(true);
              }}
              onOpenFilter={(section) => {
                setFilterSection(section);
                setFilterModalVisible(true);
              }}
              predictions={predictions}
              showPredictions={showPredictions}
              onSelectPrediction={handleSelectPrediction}
              onFocus={() => {
                setIsSearchFocused(true);
                if (predictions.length > 0) setShowPredictions(true);
              }}
              onBlur={dismissSearch}
              noMargin
              onPickOnMap={handlePickOnMap}
            />
            {/* Recent address history dropdown */}
            {showAddressHistory && (
              <View className="mt-1 rounded-xl border border-gray-200 bg-white shadow-lg">
                {/* "Pick on map" always at top */}
                <TouchableOpacity
                  className="flex-row items-center gap-3  px-4 py-3"
                  onPress={handlePickOnMap}
                >
                  <Ionicons name="map-outline" size={16} color="#588d22" />
                  <Text className="text-base font-medium text-primary">
                    {t('map.pick_on_map')}
                  </Text>
                </TouchableOpacity>
                {addressHistory.length > 0 && (
                  <>
                    <Text className="px-4 pb-1 pt-3 text-sm font-semibold text-gray-500">
                      {t('search.address_history_title')}
                    </Text>
                    {addressHistory.map((address) => (
                      <TouchableOpacity
                        key={address}
                        className="flex-row items-center gap-3 border-t border-gray-100 px-4 py-3"
                        onPress={() => handleSelectAddressHistory(address)}
                      >
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                        <Text className="flex-1 text-base text-gray-800">
                          {address}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* "Search around you" pill — shown when map center differs from user location */}
        {searchCenterCoord !== null && !isPickingLocation && coords && (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: insets.top + 140,
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 15,
            }}
          >
            <TouchableOpacity
              onPress={handleSearchAroundUser}
              className="flex-row items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-lg"
            >
              <Ionicons name="navigate" size={14} color={COLORS.primary} />
              <Text className="text-base font-semibold text-primary">
                {t('map.search_around_user')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Picking mode — top cancel bar */}
        {isPickingLocation && (
          <View
            style={{
              position: 'absolute',
              top: insets.top + 8,
              left: 12,
              right: 12,
              zIndex: 20,
            }}
          >
            <View className="flex-row items-center rounded-[50px] bg-white px-4 py-4 shadow-sm">
              <TouchableOpacity onPress={handlePickingCancel} className="mr-3">
                <Ionicons name="chevron-back" size={22} color="#333" />
              </TouchableOpacity>
              <Text className="flex-1 text-base font-semibold text-gray-700">
                {t('map.drag_to_pick')}
              </Text>
            </View>
          </View>
        )}

        <Maps
          cameraRef={cameraRef}
          initialCenter={userCenter!}
          selectedBranchId={selectedBranchId}
          isPeeked={isPeeked}
          onMarkerPress={onMarkerPress}
          onUserDrag={onUserDrag}
          onMapIdle={onMapIdle}
          branches={branches}
          branchImageMap={branchImageMap}
          ghostPins={ghostPins}
          isPickingLocation={isPickingLocation}
          searchCenter={searchCenterCoord}
        />

        {/* Detail card — slides up when a branch is selected */}
        {selectedBranch && !isPickingLocation && (
          <DetailCard
            branch={selectedBranch}
            displayName={getDisplayName(selectedBranch)}
            imageUri={branchImageMap[selectedBranch.branchId]?.[0]}
            isPeeked={isPeeked}
            onClose={onCloseDetail}
            onExpand={onExpand}
            onViewDetail={() => handleViewDetail(selectedBranch)}
          />
        )}

        {/* Picking mode — bottom confirm card */}
        {isPickingLocation && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingBottom: insets.bottom + 12,
            }}
            className="rounded-t-3xl bg-white px-5 pt-4 shadow-2xl"
          >
            <View className="mb-1 items-center">
              <View className="h-1 w-10 rounded-full bg-gray-300" />
            </View>
            <View className="mb-4 mt-3 flex-row items-start">
              <Ionicons
                name="location-sharp"
                size={20}
                color={COLORS.primary}
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-400">
                  {t('map.picked_location_label')}
                </Text>
                {isReverseGeocoding ? (
                  <View className="mt-1 flex-row items-center">
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text className="ml-2 text-base text-gray-400">
                      {t('map.finding_address')}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className="mt-0.5 text-base leading-5 text-gray-800"
                    numberOfLines={2}
                  >
                    {pickingAddress || t('map.drag_to_pick')}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={handlePickingConfirm}
              disabled={isReverseGeocoding}
              className={`items-center rounded-xl py-3.5 ${
                isReverseGeocoding ? 'bg-gray-300' : 'bg-primary'
              }`}
            >
              <Text className="text-base font-bold text-white">
                {t('map.confirm_location')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Draggable Branch list bottom sheet ── */}
      {!selectedBranch && !isPickingLocation && (
        <Animated.View
          entering={SlideInDown.springify()
            .damping(20)
            .stiffness(200)
            .mass(0.8)}
          style={[
            {
              position: 'absolute',
              top: SHEET_TOP,
              left: 0,
              right: 0,
              height: SCREEN_HEIGHT - SHEET_TOP,
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 10,
            },
            sheetAnimatedStyle,
          ]}
        >
          {/* Drag handle */}
          <GestureDetector gesture={panGesture}>
            <Animated.View className="items-center pb-2 pt-3">
              <View className="h-1 w-10 rounded-full bg-gray-300" />
              <Text className="mt-1.5 text-sm font-medium text-gray-400">
                {branches.length > 0
                  ? `${branches.length} quán ăn gần đây`
                  : ''}
              </Text>
            </Animated.View>
          </GestureDetector>

          {/* List content */}
          {branchesStatus === 'pending' ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : branchesStatus === 'failed' ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-base text-gray-500">
                {t('search.error')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (mapCenter) {
                    fetchBranchesForLocation(
                      mapCenter.lat,
                      mapCenter.lng,
                      activeFilters
                    );
                  }
                }}
                className="mt-4 rounded-full bg-primary-dark px-6 py-2"
              >
                <Text className="text-base font-semibold text-white">
                  {t('search.retry')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={branches}
              keyExtractor={(item) => String(item.branchId)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <MapBranchCard
                  branch={item}
                  displayName={getDisplayName(item)}
                  imageUri={branchImageMap[item.branchId]?.[0]}
                  onPress={() => handleListCardPress(item)}
                  onNavigate={() => handleBranchPress(item)}
                />
              )}
              ListEmptyComponent={
                <View className="items-center px-6 py-12">
                  <Text className="text-center text-base text-gray-400">
                    {t('search.empty')}
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            />
          )}
        </Animated.View>
      )}
      {/* Filter modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => {
          setFilterModalVisible(false);
          setFilterSection(null);
        }}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
        initialSection={filterSection}
      />
    </GestureHandlerRootView>
  );
};
