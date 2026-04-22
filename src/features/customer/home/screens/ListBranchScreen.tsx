import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import type { VoucherChip } from '@features/customer/home/components/common/PlaceCard';
import SearchResultCard from '@features/customer/home/components/common/SearchResultCard';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { useLocationPermission } from '@features/customer/maps/hooks/useLocationPermission';
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
  selectIsMultiBranchVendor,
  updateBranchRating,
} from '@slices/branches';
import { selectUserDietaryPreferences } from '@slices/dietary';
import { registerCallback } from '@utils/callbackRegistry';
import type { JSX } from 'react';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListBranchScreenProps = StaticScreenProps<{
  items?: ActiveBranch[];
  title?: string;
  vouchersByBranchId?: Record<number, VoucherChip[]>;
}>;

interface ListBranchItemProps {
  item: ActiveBranch;
  imageUri?: string;
  vouchers?: VoucherChip[];
  onRatingUpdate: (
    branchId: number,
    avgRating: number,
    totalReviewCount: number
  ) => void;
}

const ListBranchItem = ({
  item,
  imageUri,
  vouchers,
  onRatingUpdate,
}: ListBranchItemProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  // Look up the real vendor name from Redux branches (same as VendorCampaignPlaceCard)
  const vendorNameFromRedux = useAppSelector(
    (state) =>
      state.branches.branches.find(
        (b: { vendorId: number | null }) => b.vendorId === item.vendorId
      )?.vendorName
  );
  const isMultiBranchFromRedux = useAppSelector((state) =>
    selectIsMultiBranchVendor(state, item.vendorId)
  );

  // Heuristic fallback: if vendorName differs from name, it's a multi-branch vendor
  const isMultiBranch =
    isMultiBranchFromRedux ||
    (!!item.vendorName && item.vendorName !== item.name);

  // Prefer the Redux vendor name to correct null fallbacks set at build time
  const resolvedItem = vendorNameFromRedux
    ? { ...item, vendorName: vendorNameFromRedux }
    : item;

  const displayName = computeDisplayName(
    resolvedItem,
    isMultiBranch,
    t('branch')
  );

  return (
    <SearchResultCard
      branch={item}
      displayName={displayName}
      imageUri={imageUri}
      vouchers={vouchers}
      onPress={() =>
        navigation.navigate('RestaurantSwipe', {
          branch: item,
          displayName,
          onRatingUpdateId: registerCallback((avgRating, totalReviewCount) =>
            onRatingUpdate(item.branchId, avgRating, totalReviewCount)
          ),
        })
      }
    />
  );
};

export const ListBranchScreen = ({
  route,
}: ListBranchScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const routeItems = route.params?.items;
  const routeTitle = route.params?.title;
  const vouchersByBranchId = route.params?.vouchersByBranchId;

  const reduxBranches = useAppSelector(selectBranches);
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const branchesHasNext = useAppSelector(selectBranchesHasNext);
  const branchesLoadingMore = useAppSelector(selectBranchesLoadingMore);
  const branchesCurrentPage = useAppSelector(selectBranchesCurrentPage);
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
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
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
        renderItem={({ item }) => (
          <ListBranchItem
            item={item}
            imageUri={branchImageMap[item.branchId]?.[0]}
            vouchers={vouchersByBranchId?.[item.branchId]}
            onRatingUpdate={handleRatingUpdate}
          />
        )}
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
