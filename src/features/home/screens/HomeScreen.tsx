import { PlaceCard } from '@features/home/components/common/PlaceCard';
import BannerCarousel from '@features/home/components/home/BannerCarousel';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectUser, selectUserStatus } from '@slices/auth';
import {
  fetchActiveBranches,
  selectBranchImageMap,
  selectBranches,
  selectBranchesCurrentPage,
  selectBranchesHasNext,
  selectBranchesLoadingMore,
  selectBranchesStatus,
  selectMultiBranchVendorIds,
} from '@slices/branches';
import {
  fetchCategories,
  selectCategories,
  selectCategoriesStatus,
} from '@slices/categories';
import '@utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CategoryCard from '../components/common/CategoryCard';
import FilterModal, {
  type FilterState,
} from '../components/common/FilterModal';
import SearchBar from '../components/common/SearchBar';
import Title from '../components/common/Title';
import HomeHeader from '../components/home/HomeHeader';

const HomeScreen = (): JSX.Element => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const categories = useAppSelector(selectCategories);
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  const branches = useAppSelector(selectBranches);
  const multiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const branchesStatus = useAppSelector(selectBranchesStatus);
  const branchesHasNext = useAppSelector(selectBranchesHasNext);
  const branchesLoadingMore = useAppSelector(selectBranchesLoadingMore);
  const branchesCurrentPage = useAppSelector(selectBranchesCurrentPage);
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const handleFilterApply = (filters: FilterState): void => {
    console.log('Applied filters:', filters);
    // TODO: Apply filters to the branch list
  };

  // useRef gives an immediate lock that prevents double-fires from onEndReached
  // before Redux has time to flip loadingMore / status in state.
  const isFetchingMoreRef = useRef(false);

  // True once user has actively dragged the list.
  const hasUserDragged = useRef(false);
  // After each successful page load this is set to false.
  // It flips back to true only when the user scrolls away from the trigger
  // zone (distanceFromBottom > 600), ensuring we don't auto-chain requests.
  const canTriggerNextLoad = useRef(true);

  // Mirror Redux pagination values in refs so handleLoadMore always reads the
  // latest values — closing over Redux state causes stale closures where
  // branchesCurrentPage is still 1 even after page 2 has been stored in Redux.
  const hasNextRef = useRef(branchesHasNext);
  const currentPageRef = useRef(branchesCurrentPage);
  const branchesStatusRef = useRef(branchesStatus);
  hasNextRef.current = branchesHasNext;
  currentPageRef.current = branchesCurrentPage;
  branchesStatusRef.current = branchesStatus;

  const handleLoadMore = useCallback(() => {
    const currentPage = currentPageRef.current;

    const nextPage = currentPage + 1;
    console.log('[handleLoadMore] fetching page', nextPage);
    isFetchingMoreRef.current = true;
    currentPageRef.current = nextPage;
    canTriggerNextLoad.current = false;

    dispatch(fetchActiveBranches({ page: nextPage }))
      .then((result) => {
        console.log('[handleLoadMore] page', nextPage, 'result:', result.type);
      })
      .catch((err: unknown) => {
        // Roll back so the page can be retried.
        currentPageRef.current = currentPage;
        console.warn('[handleLoadMore] error:', err);
      })
      .finally(() => {
        isFetchingMoreRef.current = false;
        console.log('[handleLoadMore] lock released');
      });
    // dispatch is stable — no other deps needed since we read state via refs.
  }, [dispatch]);

  // Manual scroll-position check — far more reliable than onEndReached,
  // which fires on layout changes even without user interaction.
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const isScrollable = contentSize.height > layoutMeasurement.height;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;

      // Re-arm the trigger once user scrolls far enough from the bottom.
      if (distanceFromBottom > 600) {
        canTriggerNextLoad.current = true;
      }

      if (
        isScrollable &&
        hasUserDragged.current &&
        canTriggerNextLoad.current &&
        distanceFromBottom < 300
      ) {
        handleLoadMore();
      }
    },
    [handleLoadMore]
  );

  const banners = [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
  ];

  useEffect(() => {
    void dispatch(fetchCategories());
    void dispatch(fetchActiveBranches({ page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    console.log('User Status:', userStatus, 'User:', user);
    if (userStatus === 'succeeded' && user) {
      if (!user?.userInfoSetup) {
        navigation.replace('SetupUserInfo');
      } else if (user?.userInfoSetup && !user?.dietarySetup) {
        navigation.replace('DietaryPreferences');
      }
    }
  }, [user, userStatus, navigation]);

  const multiBranchSet = new Set(multiBranchVendorIds);

  // useMemo prevents a new JSX reference on every render, which would cause
  // FlatList to remount the header and re-trigger onEndReached in a loop.
  const ListHeader = useMemo(
    () => (
      <LinearGradient
        colors={['#B8E986', '#FFFFFF']}
        locations={[0, 0.4]}
        style={{ paddingTop: insets.top }}
      >
        <HomeHeader />

        <SearchBar
          onPress={() => navigation.navigate('Search')}
          onFilterPress={() => setFilterModalVisible(true)}
        />
        <BannerCarousel banners={banners} />

        <View className="px-4 py-2">
          <Title>{t('what_want_eat')}</Title>
        </View>

        <View className="flex-row px-4 pt-2">
          {categoriesStatus === 'pending' ? (
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
                  image={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=a1d973&color=fff&size=160`}
                  onPress={() => console.log(`Selected ${item.name}`)}
                />
              )}
            />
          )}
        </View>

        <View className="px-4 pb-2 pt-6">
          <Title>{t('places_might_like')}</Title>
        </View>
      </LinearGradient>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, categoriesStatus, banners, insets.top, t]
  );

  return (
    <>
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        {branchesStatus === 'pending' ? (
          <>
            {ListHeader}
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#a1d973" />
            </View>
          </>
        ) : (
          <FlatList
            data={branches}
            keyExtractor={(item) => String(item.branchId)}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={{ paddingBottom: 100 }}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
            renderItem={({ item }) => {
              const displayName = multiBranchSet.has(item.vendorId)
                ? `${item.vendorName ?? item.name} - ${item.name}`
                : item.name;
              return (
                <View className="w-[49%]">
                  <PlaceCard
                    branch={item}
                    displayName={displayName}
                    imageUri={branchImageMap[item.branchId]}
                    onPress={() => navigation.navigate('RestaurantSwipe')}
                  />
                </View>
              );
            }}
            onScroll={handleScroll}
            onScrollBeginDrag={() => {
              hasUserDragged.current = true;
            }}
            scrollEventThrottle={400}
            ListFooterComponent={
              branchesLoadingMore ? (
                <View className="items-center py-4">
                  <ActivityIndicator color="#a1d973" />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </>
  );
};

export default HomeScreen;
