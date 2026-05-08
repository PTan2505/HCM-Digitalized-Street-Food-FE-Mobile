import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import type { VoucherChip } from '@features/customer/home/components/common/PlaceCard';
import SearchResultCard from '@features/customer/home/components/common/SearchResultCard';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { useLocationPermission } from '@features/customer/maps/hooks/useLocationPermission';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useActiveBranchesQuery } from '@features/customer/home/hooks/useActiveBranchesQuery';
import { useHandleRatingUpdate } from '@features/customer/home/hooks/useHandleRatingUpdate';
import { computeDisplayName } from '@utils/computeDisplayName';
import { useUserDietaryQuery } from '@features/user/hooks/dietaryPreference/useUserDietaryQuery';
import { registerCallback } from '@utils/callbackRegistry';
import type { JSX } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListBranchScreenProps = StaticScreenProps<{
  items?: ActiveBranch[];
  title?: string;
  vouchersByBranchId?: Record<number, VoucherChip[]>;
  branchImageMap?: Record<number, string>;
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

  const isMultiBranch = !!(item.vendorName && item.vendorName !== item.name);
  const displayName = computeDisplayName(item, isMultiBranch, t('branch'));

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
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const routeItems = route.params?.items;
  const routeTitle = route.params?.title;
  const vouchersByBranchId = route.params?.vouchersByBranchId;
  const routeBranchImageMap = route.params?.branchImageMap;

  const { userDietaryPreferences } = useUserDietaryQuery();
  const { coords: userCoords } = useLocationPermission();

  const branchFilters = useMemo(
    () => ({
      lat: userCoords?.latitude,
      lng: userCoords?.longitude,
      distance: userCoords ? 5 : undefined,
      dietaryIds: userDietaryPreferences.map((p) => p.dietaryPreferenceId),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      userCoords?.latitude,
      userCoords?.longitude,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      userDietaryPreferences.map((p) => p.dietaryPreferenceId).join(','),
    ]
  );

  const isPaginated = !routeItems;

  const {
    branches: paginatedBranches,
    branchImageMap,
    hasNext: branchesHasNext,
    loadingMore: branchesLoadingMore,
    fetchNextPage,
    updateBranchRating: updateBranchRatingFn,
  } = useActiveBranchesQuery(branchFilters, isPaginated);

  const branches: ActiveBranch[] = routeItems ?? paginatedBranches;

  const handleLoadMore = useCallback(() => {
    if (!isPaginated) return;
    if (!branchesHasNext) return;
    fetchNextPage();
  }, [isPaginated, branchesHasNext, fetchNextPage]);

  const handleRatingUpdate = useHandleRatingUpdate(updateBranchRatingFn);

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
            imageUri={routeBranchImageMap?.[item.branchId] ?? branchImageMap[item.branchId]?.[0]}
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
