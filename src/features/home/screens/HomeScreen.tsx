import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRestaurantCampaigns } from '@features/campaigns/hooks/useRestaurantCampaigns';
import { useSystemCampaigns } from '@features/campaigns/hooks/useSystemCampaigns';
import { useVendorCampaignBranches } from '@features/campaigns/hooks/useVendorCampaignBranches';
import { PlaceCard } from '@features/home/components/common/PlaceCard';
import SearchBar from '@features/home/components/common/SearchBar';
import BannerCarousel from '@features/home/components/home/BannerCarousel';
import { useCategories } from '@features/home/hooks/useCategories';
import type { ActiveBranch } from '@features/home/types/branch';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectUser, selectUserStatus } from '@slices/auth';
import {
  computeDisplayName,
  fetchActiveBranches,
  selectBranchImageMap,
  selectBranches,
  selectBranchesStatus,
  selectMultiBranchVendorIds,
  updateBranchRating,
} from '@slices/branches';
import {
  selectDietaryState,
  selectUserDietaryPreferences,
} from '@slices/dietary';
import { fetchUnreadCount } from '@slices/notifications';
import '@utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CategoryCard from '../components/common/CategoryCard';
import {
  BannerCarouselSkeleton,
  CategoryRowSkeleton,
  PlaceCardRowSkeleton,
  PlaceCardSkeleton,
} from '../components/common/HomeSkeleton';
import Title from '../components/common/Title';
import HomeHeader from '../components/home/HomeHeader';
import { QuickActionGrid } from '../components/home/QuickActionGrid';
import { VendorCampaignPlaceCard } from '../components/home/VendorCampaignPlaceCard';
import { getHomeQuickActions } from '../config/homeQuickActions';

const STICKY_FADE_RANGE_PX = 40;

export const HomeScreen = (): JSX.Element => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const { categories, isLoading: categoriesLoading } = useCategories();
  const branches = useAppSelector(selectBranches);
  const multiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const branchesStatus = useAppSelector(selectBranchesStatus);
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const dietaryStatus = useAppSelector(selectDietaryState);
  const { coords: userCoords, permissionStatus } = useLocationPermission();
  const {
    systemCampaigns,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: campaignsLoading,
  } = useSystemCampaigns();
  useRestaurantCampaigns(userCoords);
  const {
    branches: vendorCampaignBranches,
    imageMap: vendorCampaignImageMap,
    isLoading: vendorCampaignLoading,
  } = useVendorCampaignBranches(userCoords, permissionStatus);
  const [refreshing, setRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyTriggerY, setStickyTriggerY] = useState(100);
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  // Track pulling state in ref to prevent unnecessary re-renders
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const showStickyBarRef = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollLogAtRef = useRef(0);

  const stickyFadeStart = Math.max(0, stickyTriggerY - 8);
  const stickyFadeEnd = stickyFadeStart + STICKY_FADE_RANGE_PX;
  const showBranchSkeleton =
    (branchesStatus === 'idle' || branchesStatus === 'pending') &&
    branches.length === 0 &&
    !refreshing;
  const isInitialError = branchesStatus === 'failed' && branches.length === 0;
  const stickyProgress = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [stickyFadeStart, stickyFadeEnd],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    [scrollY, stickyFadeStart, stickyFadeEnd]
  );

  const handleSearchBarLayout = useCallback((e: LayoutChangeEvent) => {
    setStickyTriggerY(e.nativeEvent.layout.y);
  }, []);

  // Detect pull-to-refresh gesture for immediate spinner feedback.
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = e.nativeEvent;
      const y = contentOffset.y;
      const shouldBePulling = y < -50 && !refreshing;

      if (y < 0 && Date.now() - lastScrollLogAtRef.current > 300) {
        lastScrollLogAtRef.current = Date.now();
      }

      if (shouldBePulling && !isPullingRef.current) {
        isPullingRef.current = true;
        setIsPulling(true);
      } else if (
        !shouldBePulling &&
        isPullingRef.current &&
        y >= -10 &&
        !refreshing
      ) {
        isPullingRef.current = false;
        setIsPulling(false);
      }

      const shouldEnablePointer = y >= stickyFadeEnd - 2;
      if (shouldEnablePointer !== showStickyBarRef.current) {
        showStickyBarRef.current = shouldEnablePointer;
        setShowStickyBar(shouldEnablePointer);
      }
    },
    [refreshing, stickyFadeEnd]
  );

  const handleListScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: handleScroll,
      }),
    [scrollY, handleScroll]
  );

  // Single ref: flips true once the initial page-1 fetch has been dispatched.
  // We never fire a fetch until dietary status is settled so that FETCH-A
  // (no dietary) can never race against and overwrite FETCH-B (with dietary).
  const hasFetchedRef = useRef(false);
  const fetchedWithoutCoordsRef = useRef(false);
  const hasUpgradedToCoordsRef = useRef(false);

  useEffect(() => {
    if (branchesStatus !== 'idle') return;
    // Wait for location permission to settle before fetching.
    // UNDETERMINED: dialog not yet answered.
    // For GRANTED with missing coords, proceed without coordinates to avoid
    // getting stuck when Android location providers fail.
    if (permissionStatus === Location.PermissionStatus.UNDETERMINED) return;
    // If the user completed dietary setup, wait until prefs are loaded.
    // This prevents dispatching a fetch without DietaryIds that could complete
    // *after* the dietary-enriched fetch and overwrite the result.
    if (
      user?.dietarySetup &&
      dietaryStatus !== 'succeeded' &&
      dietaryStatus !== 'failed'
    )
      return;
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    fetchedWithoutCoordsRef.current = userCoords === null;
    hasUpgradedToCoordsRef.current = userCoords !== null;
    const dietaryIds = userDietaryPreferences.map((p) => p.dietaryPreferenceId);
    void dispatch(
      fetchActiveBranches({
        page: 1,
        lat: userCoords?.latitude,
        lng: userCoords?.longitude,
        distance: userCoords ? 5 : undefined,
        dietaryIds,
      })
    );
  }, [
    branchesStatus,
    permissionStatus,
    userCoords,
    user?.dietarySetup,
    dietaryStatus,
    userDietaryPreferences,
    dispatch,
  ]);

  // If the first fetch had no location (e.g. permission just granted and coords
  // arrived a moment later), run one upgrade fetch with lat/lng.
  useEffect(() => {
    if (!hasFetchedRef.current) return;
    if (hasUpgradedToCoordsRef.current) return;
    if (!fetchedWithoutCoordsRef.current) return;
    if (permissionStatus !== Location.PermissionStatus.GRANTED) return;
    if (!userCoords) return;
    if (branchesStatus === 'pending') return;
    if (
      user?.dietarySetup &&
      dietaryStatus !== 'succeeded' &&
      dietaryStatus !== 'failed'
    )
      return;

    hasUpgradedToCoordsRef.current = true;
    const dietaryIds = userDietaryPreferences.map((p) => p.dietaryPreferenceId);
    void dispatch(
      fetchActiveBranches({
        page: 1,
        lat: userCoords.latitude,
        lng: userCoords.longitude,
        distance: 5,
        dietaryIds,
      })
    );
  }, [
    branchesStatus,
    permissionStatus,
    userCoords,
    user?.dietarySetup,
    dietaryStatus,
    userDietaryPreferences,
    dispatch,
  ]);

  useEffect(() => {
    if (userStatus === 'succeeded' && user) {
      if (!user?.userInfoSetup) {
        navigation.replace('SetupUserInfo');
      } else if (user?.userInfoSetup && !user?.dietarySetup) {
        navigation.replace('DietaryPreferences');
      }
    }
  }, [user, userStatus, navigation]);

  // Re-fetch home branches when screen regains focus (e.g. coming back from
  // MapScreen which may have overwritten the shared Redux branches state with
  // branches for a different location).
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      // Only re-fetch if the initial load already happened
      if (!hasFetchedRef.current) return;
      const dietaryIds = userDietaryPreferences.map(
        (p) => p.dietaryPreferenceId
      );
      void dispatch(
        fetchActiveBranches({
          page: 1,
          lat: userCoords?.latitude,
          lng: userCoords?.longitude,
          distance: userCoords ? 5 : undefined,
          dietaryIds,
        })
      );
    }, [dispatch, userCoords, userDietaryPreferences])
  );

  useEffect(() => {
    void dispatch(fetchUnreadCount());
  }, [dispatch]);

  const handleCampaignPress = useCallback(
    (campaignId: string, campaignType: 'system' | 'restaurant') => {
      if (campaignType === 'system') {
        navigation.navigate('SystemCampaignDetail', { campaignId });
      } else {
        navigation.navigate('RestaurantCampaignDetail', { campaignId });
      }
    },
    [navigation]
  );

  // Callback to update branch rating in Redux when navigating back from detail screens
  const handleRatingUpdate = useCallback(
    (branchId: number, avgRating: number, totalReviewCount: number) => {
      dispatch(updateBranchRating({ branchId, avgRating, totalReviewCount }));
    },
    [dispatch]
  );

  const vendorCampaignVouchersByBranchId = useMemo(() => {
    const map: Record<
      number,
      Array<{ voucherId: number; discountValue: number; type: string }>
    > = {};
    vendorCampaignBranches.forEach((b) => {
      const vouchers = b.campaigns.flatMap((c) => c.vouchers);
      if (vouchers.length > 0) map[b.branchId] = vouchers;
    });
    return map;
  }, [vendorCampaignBranches]);

  const vendorCampaignActiveBranches = useMemo<ActiveBranch[]>(
    () =>
      vendorCampaignBranches.map((b) => ({
        branchId: b.branchId,
        vendorId: b.vendorId,
        vendorName: b.vendorName ?? b.name,
        managerId: b.managerId ?? 0,
        name: b.name,
        phoneNumber: b.phoneNumber,
        email: b.email,
        addressDetail: b.addressDetail,
        ward: b.ward,
        city: b.city,
        lat: b.lat,
        long: b.long,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt ?? null,
        isVerified: b.isVerified,
        avgRating: b.avgRating,
        totalReviewCount: b.totalReviewCount,
        totalRatingSum: 0,
        isActive: b.isActive,
        isSubscribed: b.isSubscribed,
        tierId: b.tierId,
        tierName: b.tierName,
        finalScore: b.finalScore,
        distanceKm: b.distanceKm ?? null,
        dietaryPreferenceNames: [],
        dishes: [],
      })),
    [vendorCampaignBranches]
  );

  const onRefresh = useCallback(() => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    setRefreshing(true);
    isPullingRef.current = false;
    setIsPulling(false);

    requestAnimationFrame(() => {
      dispatch(
        fetchActiveBranches({
          page: 1,
          lat: userCoords?.latitude,
          lng: userCoords?.longitude,
          distance: 5,
          dietaryIds: userDietaryPreferences.map((p) => p.dietaryPreferenceId),
        })
      ).finally(() => {
        isRefreshingRef.current = false;
        setRefreshing(false);
        isPullingRef.current = false;
        setIsPulling(false);
      });
    });
  }, [dispatch, userCoords, userDietaryPreferences]);

  // useMemo prevents a new JSX reference on every render, which would cause
  // FlatList to remount the header and re-trigger onEndReached in a loop.
  const ListHeader = useMemo(
    () => (
      <LinearGradient
        colors={[COLORS.primaryGradientHero, '#FFFFFF']}
        locations={[0, 0.4]}
        style={{
          paddingTop:
            refreshing && Platform.OS === 'ios' ? insets.top + 60 : insets.top,
        }}
      >
        <HomeHeader />

        <View onLayout={handleSearchBarLayout}>
          <SearchBar
            onPress={() => navigation.navigate('Search', { autoFocus: true })}
            onFilterPress={() =>
              navigation.navigate('Search', { openFilter: true })
            }
          />
        </View>
        {campaignsLoading ? (
          <BannerCarouselSkeleton />
        ) : (
          <BannerCarousel
            items={systemCampaigns}
            onCampaignPress={handleCampaignPress}
            onLoadMore={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            hasMore={hasNextPage}
          />
        )}

        <View className="px-4 py-2">
          <Title>{t('home_quick_actions.section_title')}</Title>
        </View>
        <QuickActionGrid actions={getHomeQuickActions(t, navigation)} />

        <View className="px-4 py-2">
          <Title>{t('what_want_eat')}</Title>
        </View>

        <View className="flex-row pt-2">
          {categoriesLoading ? (
            <CategoryRowSkeleton />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => String(item.categoryId)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 8,
                paddingBottom: 4,
              }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => (
                <CategoryCard
                  title={item.name}
                  image={
                    item.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=a1d973&color=fff&size=160`
                  }
                  onPress={() =>
                    navigation.navigate('Search', {
                      selectedCategoryId: String(item.categoryId),
                    })
                  }
                />
              )}
            />
          )}
        </View>

        {vendorCampaignLoading ? (
          <>
            <View className="flex-row items-center gap-2 px-4 py-2">
              <Title>{t('discount_branches_title')}</Title>
            </View>
            <View className="px-4">
              <PlaceCardRowSkeleton />
            </View>
          </>
        ) : vendorCampaignActiveBranches.length > 0 ? (
          <>
            <TouchableOpacity
              className="flex-row items-center gap-2 px-4 py-2"
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('ListBranch', {
                  items: vendorCampaignActiveBranches,
                  title: t('discount_branches_title'),
                  vouchersByBranchId: vendorCampaignVouchersByBranchId,
                })
              }
            >
              <Title>{t('discount_branches_title')}</Title>
              <Ionicons
                name="chevron-forward-circle"
                size={20}
                color={COLORS.primaryGradientFrom}
              />
            </TouchableOpacity>
            <View className="px-4">
              {Array.from({
                length: Math.ceil(vendorCampaignActiveBranches.length / 2),
              }).map((_, rowIndex) => {
                const left = vendorCampaignActiveBranches[rowIndex * 2];
                const right = vendorCampaignActiveBranches[rowIndex * 2 + 1];
                return (
                  <View
                    key={rowIndex}
                    className="mb-3 flex-row justify-between"
                  >
                    <View className="w-[49%]">
                      <VendorCampaignPlaceCard
                        branch={left}
                        imageUri={vendorCampaignImageMap[left.branchId]}
                        userCoords={userCoords}
                        vouchers={
                          vendorCampaignVouchersByBranchId[left.branchId]
                        }
                        onRatingUpdate={(avgRating, totalReviewCount) =>
                          handleRatingUpdate(
                            left.branchId,
                            avgRating,
                            totalReviewCount
                          )
                        }
                      />
                    </View>
                    {right ? (
                      <View className="w-[49%]">
                        <VendorCampaignPlaceCard
                          branch={right}
                          imageUri={vendorCampaignImageMap[right.branchId]}
                          userCoords={userCoords}
                          vouchers={
                            vendorCampaignVouchersByBranchId[right.branchId]
                          }
                          onRatingUpdate={(avgRating, totalReviewCount) =>
                            handleRatingUpdate(
                              right.branchId,
                              avgRating,
                              totalReviewCount
                            )
                          }
                        />
                      </View>
                    ) : (
                      <View className="w-[49%]" />
                    )}
                  </View>
                );
              })}
            </View>
          </>
        ) : null}

        <TouchableOpacity
          className="flex-row items-center gap-2 px-4 py-2"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ListBranch', {})}
        >
          <Title>{t('places_might_like')}</Title>
          <Ionicons
            name="chevron-forward-circle"
            size={20}
            color={COLORS.primaryGradientFrom}
          />
        </TouchableOpacity>
      </LinearGradient>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      categories,
      categoriesLoading,
      campaignsLoading,
      vendorCampaignLoading,
      systemCampaigns,
      vendorCampaignActiveBranches,
      vendorCampaignImageMap,
      vendorCampaignVouchersByBranchId,
      handleCampaignPress,
      handleRatingUpdate,
      handleSearchBarLayout,
      insets.top,
      refreshing,
      t,
      userCoords,
    ]
  );

  type ListItem = ActiveBranch | { _skeleton: true; id: number };
  const skeletonItems: ListItem[] = Array.from({ length: 6 }, (_, i) => ({
    _skeleton: true as const,
    id: i,
  }));
  const flatListData: ListItem[] = showBranchSkeleton
    ? skeletonItems
    : (branches.slice(0, 10) as ListItem[]);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 200, // Cover the notch + some extra
          backgroundColor: COLORS.primaryGradientHero,
        }}
      />
      <View>
        <Animated.FlatList
          data={flatListData}
          keyExtractor={(item) =>
            '_skeleton' in item ? `skeleton-${item.id}` : String(item.branchId)
          }
          numColumns={2}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingBottom: 100,
            backgroundColor: 'white',
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={
                Platform.OS === 'android' ? insets.top + 60 : 0
              }
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              progressBackgroundColor="#ffffff"
            />
          }
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
          renderItem={({ item }) => {
            if ('_skeleton' in item) {
              return (
                <View className="w-[49%]">
                  <PlaceCardSkeleton />
                </View>
              );
            }
            const isMultiBranch = multiBranchVendorIds.includes(item.vendorId);
            const displayName = computeDisplayName(
              item,
              isMultiBranch,
              t('branch')
            );
            return (
              <View className="w-[49%]">
                <PlaceCard
                  branch={item}
                  displayName={displayName}
                  imageUri={branchImageMap[item.branchId]?.[0]}
                  userCoords={userCoords}
                  onPress={() =>
                    navigation.navigate('RestaurantSwipe', {
                      branch: item,
                      displayName,
                      onRatingUpdate: (avgRating, totalReviewCount) =>
                        handleRatingUpdate(
                          item.branchId,
                          avgRating,
                          totalReviewCount
                        ),
                    })
                  }
                />
              </View>
            );
          }}
          ListEmptyComponent={
            isInitialError ? (
              <View className="flex-1 items-center justify-center px-6 py-12">
                <Text className="text-center text-base text-gray-500">
                  {t('search.error')}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    dispatch(
                      fetchActiveBranches({
                        page: 1,
                        lat: userCoords?.latitude,
                        lng: userCoords?.longitude,
                        dietaryIds: userDietaryPreferences.map(
                          (p) => p.dietaryPreferenceId
                        ),
                      })
                    )
                  }
                  className="mt-4 rounded-full bg-primary-dark px-6 py-2"
                >
                  <Text className="text-base font-semibold text-white">
                    {t('search.retry')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center px-6 py-12">
                <Text className="text-center text-base text-gray-400">
                  {t('search.empty')}
                </Text>
              </View>
            )
          }
          onScroll={handleListScroll}
          scrollEventThrottle={16}
        />
        {isPulling && !refreshing && (
          <>
            <View
              style={{
                position: 'absolute',
                top: insets.top + 10,
                left: 0,
                right: 0,
                alignItems: 'center',
                zIndex: 9999,
                elevation: 9999,
              }}
              pointerEvents="none"
            >
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  padding: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            </View>
          </>
        )}
      </View>
      {/* Sticky SearchBar — appears when the in-list bar scrolls out of view */}
      <Animated.View
        pointerEvents={showStickyBar ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          elevation: 100,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          opacity: stickyProgress,
          transform: [
            {
              translateY: stickyProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [-12, 0],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={[COLORS.primaryGradientHero, '#FFFFFF']}
          style={{ paddingTop: insets.top, paddingBottom: 4 }}
        >
          <SearchBar
            onPress={() => navigation.navigate('Search', { autoFocus: true })}
            onFilterPress={() =>
              navigation.navigate('Search', { openFilter: true })
            }
          />
        </LinearGradient>
        {/* Soft fade-out — multi-stop cubic curve for a natural blend */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,1)',
            'rgba(255,255,255,0.7)',
            'rgba(255,255,255,0.3)',
            'rgba(255,255,255,0.05)',
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.3, 0.6, 0.85, 1]}
          style={{ height: 32 }}
          pointerEvents="none"
        />
      </Animated.View>
    </SafeAreaView>
  );
};
