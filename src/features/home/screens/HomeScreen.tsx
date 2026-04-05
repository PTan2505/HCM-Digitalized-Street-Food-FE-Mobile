import { Ionicons } from '@expo/vector-icons';
import { useRestaurantCampaigns } from '@features/campaigns/hooks/useRestaurantCampaigns';
import { useSystemCampaigns } from '@features/campaigns/hooks/useSystemCampaigns';
import { useVendorCampaignBranches } from '@features/campaigns/hooks/useVendorCampaignBranches';
import { PlaceCard } from '@features/home/components/common/PlaceCard';
import SearchBar from '@features/home/components/common/SearchBar';
import BannerCarousel from '@features/home/components/home/BannerCarousel';
import { useCategories } from '@features/home/hooks/useCategories';
import type { ActiveBranch } from '@features/home/types/branch';
import * as Location from 'expo-location';
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
import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Easing,
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
import Title from '../components/common/Title';
import HomeHeader from '../components/home/HomeHeader';
import { QuickActionGrid } from '../components/home/QuickActionGrid';
import { VendorCampaignPlaceCard } from '../components/home/VendorCampaignPlaceCard';
import { getHomeQuickActions } from '../config/homeQuickActions';

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
  const { systemCampaigns, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSystemCampaigns();
  useRestaurantCampaigns(userCoords);
  const { branches: vendorCampaignBranches, imageMap: vendorCampaignImageMap } =
    useVendorCampaignBranches(userCoords, permissionStatus);
  const [refreshing, setRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  // Track pulling state in ref to prevent unnecessary re-renders
  const isPullingRef = useRef(false);
  // Y offset of the SearchBar within the scroll content (set via onLayout)
  const searchBarOffsetRef = useRef(100);
  const showStickyBarRef = useRef(false);
  const stickyAnim = useRef(new Animated.Value(0)).current;

  const handleSearchBarLayout = useCallback((e: LayoutChangeEvent) => {
    searchBarOffsetRef.current = e.nativeEvent.layout.y;
  }, []);

  // Detect pull-to-refresh gesture for immediate spinner feedback.
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = e.nativeEvent;
      const y = contentOffset.y;
      const shouldBePulling = y < -50 && !refreshing;

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

      // Sticky SearchBar: show when the in-list SearchBar scrolls out of view
      const shouldShow = y > searchBarOffsetRef.current;
      if (shouldShow !== showStickyBarRef.current) {
        showStickyBarRef.current = shouldShow;
        setShowStickyBar(shouldShow);
      }
    },
    [refreshing]
  );

  useEffect(() => {
    Animated.timing(stickyAnim, {
      toValue: showStickyBar ? 1 : 0,
      duration: 220,
      easing: showStickyBar
        ? Easing.out(Easing.cubic)
        : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showStickyBar, stickyAnim]);

  // Single ref: flips true once the initial page-1 fetch has been dispatched.
  // We never fire a fetch until dietary status is settled so that FETCH-A
  // (no dietary) can never race against and overwrite FETCH-B (with dietary).
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (branchesStatus !== 'idle') return;
    // Wait for location permission to settle before fetching.
    // UNDETERMINED: dialog not yet answered; GRANTED+no coords: still resolving.
    // If DENIED, proceed immediately without coordinates.
    if (permissionStatus === Location.PermissionStatus.UNDETERMINED) return;
    if (
      permissionStatus === Location.PermissionStatus.GRANTED &&
      userCoords === null
    )
      return;
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

  useEffect(() => {
    if (userStatus === 'succeeded' && user) {
      if (!user?.userInfoSetup) {
        navigation.replace('SetupUserInfo');
      } else if (user?.userInfoSetup && !user?.dietarySetup) {
        navigation.replace('DietaryPreferences');
      }
    }
  }, [user, userStatus, navigation]);

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
        isSubscribed: false,
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
    setRefreshing(true);
    // Don't reset isPulling here - let refreshing take over seamlessly
    // isPulling will be reset when refreshing completes
    dispatch(
      fetchActiveBranches({
        page: 1,
        lat: userCoords?.latitude,
        lng: userCoords?.longitude,
        distance: 5,
        dietaryIds: userDietaryPreferences.map((p) => p.dietaryPreferenceId),
      })
    )
      .then(() => {
        setTimeout(() => {
          setRefreshing(false);
          // Reset isPulling after refreshing is done to ensure smooth transition
          isPullingRef.current = false;
          setIsPulling(false);
        }, 500);
      })
      .catch(() => {
        setRefreshing(false);
        isPullingRef.current = false;
        setIsPulling(false);
      });
  }, [dispatch, userCoords, userDietaryPreferences]);

  // useMemo prevents a new JSX reference on every render, which would cause
  // FlatList to remount the header and re-trigger onEndReached in a loop.
  const ListHeader = useMemo(
    () => (
      <LinearGradient
        colors={['#B8E986', '#FFFFFF']}
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
        <BannerCarousel
          items={systemCampaigns}
          onCampaignPress={handleCampaignPress}
          onLoadMore={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          hasMore={hasNextPage}
        />

        <View className="px-4 py-2">
          <Title>{t('home_quick_actions.section_title')}</Title>
        </View>
        <QuickActionGrid actions={getHomeQuickActions(t, navigation)} />

        <View className="px-4 py-2">
          <Title>{t('what_want_eat')}</Title>
        </View>

        <View className="flex-row pt-2">
          {categoriesLoading ? (
            <View className="flex-1 items-center py-4">
              <ActivityIndicator color="#a1d973" />
            </View>
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

        {vendorCampaignActiveBranches.length > 0 && (
          <>
            <TouchableOpacity
              className="flex-row items-center gap-2 px-4 py-2"
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('ListBranch', {
                  items: vendorCampaignActiveBranches,
                  title: t('discount_branches_title'),
                })
              }
            >
              <Title>{t('discount_branches_title')}</Title>
              <Ionicons
                name="chevron-forward-circle"
                size={20}
                color="#89D151"
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
        )}

        <TouchableOpacity
          className="flex-row items-center gap-2 px-4 py-2"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ListBranch', {})}
        >
          <Title>{t('places_might_like')}</Title>
          <Ionicons name="chevron-forward-circle" size={20} color="#89D151" />
        </TouchableOpacity>
      </LinearGradient>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      categories,
      categoriesLoading,
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

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 200, // Cover the notch + some extra
          backgroundColor: '#B8E986',
        }}
      />
      {branchesStatus === 'pending' ? (
        <>
          {ListHeader}
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#a1d973" />
          </View>
        </>
      ) : branchesStatus === 'failed' ? (
        <>
          {ListHeader}
          <View className="flex-1 items-center justify-center bg-white px-6">
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
              className="mt-4 rounded-full bg-[#06AA4C] px-6 py-2"
            >
              <Text className="text-sm font-semibold text-white">
                {t('search.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View>
          <FlatList
            data={branches.slice(0, 10)}
            keyExtractor={(item) => String(item.branchId)}
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
                colors={['#a1d973']} // Android spinner color
                tintColor="#a1d973" // iOS spinner color
                progressBackgroundColor="#ffffff" // Android spinner background
              />
            }
            columnWrapperStyle={{
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
            renderItem={({ item }) => {
              const isMultiBranch = multiBranchVendorIds.includes(
                item.vendorId
              );
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
              <View className="items-center px-6 py-12">
                <Text className="text-center text-base text-gray-400">
                  {t('search.empty')}
                </Text>
              </View>
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          {(refreshing || isPulling) && (
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
                  <ActivityIndicator size="small" color="#a1d973" />
                </View>
              </View>
            </>
          )}
        </View>
      )}
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
          opacity: stickyAnim,
          transform: [
            {
              translateY: stickyAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-12, 0],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={['#B8E986', '#FFFFFF']}
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
