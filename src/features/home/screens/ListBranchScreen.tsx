import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import SearchResultCard from '@features/home/components/common/SearchResultCard';
import type { ActiveBranch } from '@features/home/types/branch';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  computeDisplayName,
  fetchActiveBranches,
  selectBranchImageMap,
  selectBranches,
  selectBranchesCurrentPage,
  selectBranchesHasNext,
  selectBranchesLoadingMore,
  selectMultiBranchVendorIds,
  updateBranchRating,
} from '@slices/branches';
import { selectUserDietaryPreferences } from '@slices/dietary';
import type { JSX } from 'react';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListBranchScreenProps = StaticScreenProps<{
  items?: ActiveBranch[];
  title?: string;
}>;

export const ListBranchScreen = ({
  route,
}: ListBranchScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const routeItems = route.params?.items;
  const routeTitle = route.params?.title;

  const reduxBranches = useAppSelector(selectBranches);
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const branchesHasNext = useAppSelector(selectBranchesHasNext);
  const branchesLoadingMore = useAppSelector(selectBranchesLoadingMore);
  const branchesCurrentPage = useAppSelector(selectBranchesCurrentPage);
  const multiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const { coords: userCoords } = useLocationPermission();

  // Use route items if provided (e.g. campaign branches), otherwise use Redux state with pagination
  const branches: ActiveBranch[] = routeItems ?? reduxBranches;
  const isPaginated = !routeItems;

  const isFetchingMoreRef = useRef(false);

  const handleLoadMore = useCallback(() => {
    if (!isPaginated) return;
    if (isFetchingMoreRef.current) return;
    if (!branchesHasNext) return;

    isFetchingMoreRef.current = true;

    dispatch(
      fetchActiveBranches({
        page: branchesCurrentPage + 1,
        lat: userCoords?.latitude,
        lng: userCoords?.longitude,
        distance: userCoords ? 5 : undefined,
        dietaryIds: userDietaryPreferences.map((p) => p.dietaryPreferenceId),
      })
    ).finally(() => {
      isFetchingMoreRef.current = false;
    });
  }, [
    isPaginated,
    branchesHasNext,
    branchesCurrentPage,
    dispatch,
    userCoords,
    userDietaryPreferences,
  ]);

  const handleRatingUpdate = useCallback(
    (branchId: number, avgRating: number, totalReviewCount: number) => {
      dispatch(updateBranchRating({ branchId, avgRating, totalReviewCount }));
    },
    [dispatch]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <Header
        title={routeTitle ?? t('places_might_like')}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={branches}
        keyExtractor={(item) => String(item.branchId)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => {
          const isMultiBranch = multiBranchVendorIds.includes(item.vendorId);
          const displayName = computeDisplayName(
            item,
            isMultiBranch,
            t('branch')
          );
          return (
            <SearchResultCard
              branch={item}
              displayName={displayName}
              imageUri={branchImageMap[item.branchId]?.[0]}
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
          );
        }}
        ListEmptyComponent={
          <View className="items-center px-6 py-12">
            <Text className="text-center text-base text-gray-400">
              {t('search.empty')}
            </Text>
          </View>
        }
        ListFooterComponent={
          isPaginated && branchesLoadingMore ? (
            <View className="items-center py-4">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
    </SafeAreaView>
  );
};
