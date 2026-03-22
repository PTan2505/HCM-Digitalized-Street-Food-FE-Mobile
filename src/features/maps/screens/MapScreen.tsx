import type { FilterSection, FilterState } from '@custom-types/filter';
import FilterModal from '@features/home/components/common/FilterModal';
import SearchBar from '@features/home/components/common/SearchBar';
import type { ActiveBranch } from '@features/home/types/branch';
import type { GhostPinResponse } from '@features/maps/api/ghostPinApi';
import { DetailCard } from '@features/maps/components/DetailCard';
import { MapBranchCard } from '@features/maps/components/MapBranchCard';
import { CAMERA_BOTTOM_PADDING, Maps } from '@features/maps/components/Maps';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import {
  type AutocompletePrediction,
  getPlaceDetail,
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
import * as Location from 'expo-location';
import type { JSX } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
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

  // Search state
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "Search this area" state
  const [showSearchArea, setShowSearchArea] = useState(false);
  const pendingCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  // ── Bottom sheet snap points ──
  // Positions are translateY values from the top of the sheet's natural position.
  // 0 = fully expanded (sheet at ~30% from top), positive = pushed down.
  const SNAP_EXPANDED = 0;
  const SNAP_HALF = SCREEN_HEIGHT * 0.2; // half position
  const SNAP_COLLAPSED = SCREEN_HEIGHT * 0.42; // only ~100px peek visible

  const sheetTranslateY = useSharedValue(SNAP_HALF);
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
      setShowSearchArea(false);
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
    Keyboard.dismiss();
  }, []);

  // ── Select a prediction → move camera & fetch branches ──
  const handleSelectPrediction = useCallback(
    async (prediction: AutocompletePrediction) => {
      setShowPredictions(false);
      setSearchText(prediction.mainText);
      Keyboard.dismiss();

      const detail = await getPlaceDetail(prediction.placeId);
      if (!detail) return;

      const newCenter: [number, number] = [detail.lng, detail.lat];
      cameraRef.current?.setCamera({
        centerCoordinate: newCenter,
        zoomLevel: 14,
        animationDuration: 800,
        animationMode: 'easeTo',
      });

      fetchBranchesForLocation(detail.lat, detail.lng);
    },
    [fetchBranchesForLocation]
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

      dismissSearch();
      setSelectedBranchId(branchId);
      setIsPeeked(false);

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

  // ── User drags map → peek card + dismiss search + track new center ──
  const onUserDrag = useCallback(() => {
    if (selectedBranchId) {
      setIsPeeked(true);
    }
    dismissSearch();
  }, [selectedBranchId, dismissSearch]);

  // ── Map stopped moving → check if center changed significantly ──
  const onMapIdle = useCallback(
    (center: [number, number]) => {
      const [lng, lat] = center;
      pendingCenterRef.current = { lat, lng };
      if (!mapCenter) return;
      const dist = Math.sqrt(
        (lat - mapCenter.lat) ** 2 + (lng - mapCenter.lng) ** 2
      );
      if (dist > 0.01 && !selectedBranchId) {
        setShowSearchArea(true);
      }
    },
    [mapCenter, selectedBranchId]
  );

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
        onRatingUpdate: (avgRating, totalReviewCount) =>
          handleRatingUpdate(branch.branchId, avgRating, totalReviewCount),
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
        onRatingUpdate: (avgRating, totalReviewCount) =>
          handleRatingUpdate(branch.branchId, avgRating, totalReviewCount),
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

  // Height of the sheet from the top of the screen when fully expanded
  const SHEET_TOP = SCREEN_HEIGHT * 0.3;

  return (
    <GestureHandlerRootView className="flex-1 bg-white">
      {/* ── Full-screen Map ── */}
      <View className="flex-1">
        {/* Search bar overlay at top */}
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
            placeholder="Tìm địa chỉ..."
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
              if (predictions.length > 0) setShowPredictions(true);
            }}
            onBlur={dismissSearch}
            showSearchAreaButton={showSearchArea}
            onSearchArea={() => {
              if (pendingCenterRef.current) {
                fetchBranchesForLocation(
                  pendingCenterRef.current.lat,
                  pendingCenterRef.current.lng,
                  activeFilters
                );
              }
            }}
            searchAreaButtonText="Tìm khu vực này"
            topInset={insets.top}
            noMargin
          />
        </View>

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
        />

        {/* Detail card — slides up when a branch is selected */}
        {selectedBranch && (
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
      </View>

      {/* ── Draggable Branch list bottom sheet ── */}
      {!selectedBranch && (
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
              <Text className="mt-1.5 text-xs font-medium text-gray-400">
                {branches.length > 0
                  ? `${branches.length} quán ăn gần đây`
                  : ''}
              </Text>
            </Animated.View>
          </GestureDetector>

          {/* List content */}
          {branchesStatus === 'pending' ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#a1d973" />
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
                className="mt-4 rounded-full bg-[#06AA4C] px-6 py-2"
              >
                <Text className="text-sm font-semibold text-white">
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
