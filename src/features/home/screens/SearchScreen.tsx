import { Ionicons } from '@expo/vector-icons';
import FilterModal, {
  type FilterState,
} from '@features/home/components/common/FilterModal';
import SearchBar from '@features/home/components/common/SearchBar';
import SearchResultCard from '@features/home/components/common/SearchResultCard';
import { useStallSearch } from '@features/home/hooks/useStallSearch';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
  computeDisplayName,
  selectBranchImageMap,
  selectBranches,
  selectMultiBranchVendorIds,
  updateBranchRating,
} from '@slices/branches';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SearchScreenProps = StaticScreenProps<{
  autoFocus?: boolean;
  openFilter?: boolean;
}>;

export const SearchScreen = ({ route }: SearchScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const { autoFocus, openFilter } = route.params ?? {};
  const [keyword, setKeyword] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const branches = useAppSelector(selectBranches);
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const multiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);

  useEffect(() => {
    if (!openFilter) return;
    const task = InteractionManager.runAfterInteractions(() => {
      setFilterModalVisible(true);
    });
    return (): void => task.cancel();
  }, [openFilter]);

  const { coords } = useLocationPermission();
  const { stalls, isLoading, error, search, clearError } = useStallSearch();

  const triggerSearch = useCallback(
    (kw: string, filters: FilterState | null) => {
      if (!coords) return;
      search({
        Lat: coords.latitude,
        Long: coords.longitude,
        Keyword: kw || undefined,
        Distance: filters?.distance,
        TasteIds: filters?.tasteTags
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        DietaryIds: filters?.dietaryTags
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        MinPrice: filters?.minPrice,
        MaxPrice: filters?.maxPrice,
      });
    },
    [coords, search]
  );

  const handleSearch = (text: string): void => {
    setKeyword(text);
    if (!text.trim() && !activeFilters) {
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    triggerSearch(text, activeFilters);
  };

  const handleFilterApply = (filters: FilterState): void => {
    setActiveFilters(filters);
    setFilterModalVisible(false);
    setHasSearched(true);
    triggerSearch(keyword, filters);
  };

  const handleRatingUpdate = useCallback(
    (branchId: number, avgRating: number, totalReviewCount: number) => {
      dispatch(updateBranchRating({ branchId, avgRating, totalReviewCount }));
    },
    [dispatch]
  );

  const renderEmptyOrError = (): JSX.Element => {
    if (!hasSearched) return <View />;
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#06AA4C" />
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Ionicons name="wifi-outline" size={48} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base text-gray-500">
            {t('search.error')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              clearError();
              triggerSearch(keyword, activeFilters);
            }}
            className="mt-4 rounded-full bg-[#06AA4C] px-6 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              {t('search.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (stalls.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Ionicons name="search-outline" size={48} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base font-medium text-gray-500">
            {t('search.empty')}
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            {t('search.empty_hint')}
          </Text>
        </View>
      );
    }
    return <View />;
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-1">
        {/* Search Bar */}
        <View className="mb-4 flex-row items-center gap-3 px-4 pt-2">
          <View className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              onFilterPress={() => setFilterModalVisible(true)}
              noMargin
              autoFocus={autoFocus}
            />
          </View>
          <TouchableOpacity className="items-center justify-center">
            <Ionicons name="map-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center justify-center">
            <Ionicons name="bookmark-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Results List */}
        <View className="flex-1 px-4">
          <FlatList
            data={hasSearched ? stalls : branches}
            keyExtractor={(item) => String(item.branchId)}
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
                <SearchResultCard
                  branch={item}
                  imageUri={branchImageMap[item.branchId]?.[0]}
                  displayName={displayName}
                  onPress={() =>
                    navigation.navigate('RestaurantDetails', {
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, flexGrow: 1 }}
            ListEmptyComponent={renderEmptyOrError}
          />
        </View>
      </View>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
};
