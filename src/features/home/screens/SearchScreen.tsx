import { FilterChipBar } from '@components/FilterChipBar';
import type { FilterSection, FilterState } from '@custom-types/filter';
import { Ionicons } from '@expo/vector-icons';
import FilterModal from '@features/home/components/common/FilterModal';
import SearchBar from '@features/home/components/common/SearchBar';
import SearchResultCard from '@features/home/components/common/SearchResultCard';
import { useCategories } from '@features/home/hooks/useCategories';
import { useStallSearch } from '@features/home/hooks/useStallSearch';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
  computeDisplayName,
  selectBranchImageMap,
  selectMultiBranchVendorIds,
  updateBranchRating,
} from '@slices/branches';
import { selectDietaryPreferences } from '@slices/dietary';
import { selectTastes } from '@slices/tastes';
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

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 5000000;
const DEFAULT_DISTANCE = 5;

const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}): JSX.Element => (
  <View className="mr-2 flex-row items-center rounded-full bg-[#E8F8F0] px-3 py-1">
    <Text className="mr-1 text-sm font-medium text-[#06AA4C]">{label}</Text>
    <TouchableOpacity onPress={onRemove} hitSlop={6}>
      <Ionicons name="close" size={14} color="#06AA4C" />
    </TouchableOpacity>
  </View>
);

export const SearchScreen = ({ route }: SearchScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const { autoFocus, openFilter } = route.params ?? {};
  const [keyword, setKeyword] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterSection, setFilterSection] = useState<FilterSection | null>(
    null
  );
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const multiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);
  const dietaryPreferences = useAppSelector(selectDietaryPreferences);
  const tastes = useAppSelector(selectTastes);
  const { categories } = useCategories();

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
        Keyword: kw || undefined,
        Lat: coords.latitude,
        Long: coords.longitude,
        Distance: filters?.distance,
        DietaryIds: filters?.dietaryTags
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        TasteIds: filters?.tasteTags
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        MinPrice: filters?.minPrice,
        MaxPrice: filters?.maxPrice,
        CategoryIds: filters?.categoryIds
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
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

  const handleRemoveFilter = (
    updater: (f: FilterState) => FilterState
  ): void => {
    if (!activeFilters) return;
    const updated = updater(activeFilters);
    const hasActive =
      updated.dietaryTags.length > 0 ||
      updated.tasteTags.length > 0 ||
      updated.categoryIds.length > 0 ||
      updated.minPrice > DEFAULT_MIN_PRICE ||
      updated.maxPrice < DEFAULT_MAX_PRICE ||
      updated.distance !== DEFAULT_DISTANCE;
    if (!hasActive) {
      setActiveFilters(null);
      if (!keyword.trim()) {
        setHasSearched(false);
      } else {
        triggerSearch(keyword, null);
      }
    } else {
      setActiveFilters(updated);
      triggerSearch(keyword, updated);
    }
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

  const hasFilterChips =
    activeFilters !== null &&
    (activeFilters.dietaryTags.length > 0 ||
      activeFilters.tasteTags.length > 0 ||
      activeFilters.categoryIds.length > 0 ||
      activeFilters.minPrice > DEFAULT_MIN_PRICE ||
      activeFilters.maxPrice < DEFAULT_MAX_PRICE ||
      activeFilters.distance !== DEFAULT_DISTANCE);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-1">
        {/* Search Bar */}
        <View className="mb-2 flex-row items-center gap-3 px-4 pt-2">
          <TouchableOpacity
            onPress={(): void => navigation.goBack()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              onFilterPress={() => {
                setFilterSection(null);
                setFilterModalVisible(true);
              }}
              noMargin
              autoFocus={autoFocus}
            />
          </View>
          <TouchableOpacity
            className="items-center justify-center"
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center justify-center">
            <Ionicons name="bookmark-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Filter category chips */}
        <FilterChipBar
          activeFilters={activeFilters}
          onOpenFilter={(section) => {
            setFilterSection(section);
            setFilterModalVisible(true);
          }}
        />

        {/* Active filter chips */}
        {activeFilters !== null && hasFilterChips && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginBottom: 8 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
              alignItems: 'center',
            }}
            keyExtractor={(item) => item.key}
            data={[
              ...activeFilters.dietaryTags.flatMap((id) => {
                const pref = dietaryPreferences.find(
                  (p) => p.dietaryPreferenceId.toString() === id
                );
                if (!pref) return [];
                return [
                  {
                    key: `dietary-${id}`,
                    label: pref.name,
                    onRemove: () =>
                      handleRemoveFilter((f) => ({
                        ...f,
                        dietaryTags: f.dietaryTags.filter((v) => v !== id),
                      })),
                  },
                ];
              }),
              ...activeFilters.tasteTags.flatMap((id) => {
                const taste = tastes.find((ta) => ta.tasteId.toString() === id);
                if (!taste) return [];
                return [
                  {
                    key: `taste-${id}`,
                    label: taste.name,
                    onRemove: () =>
                      handleRemoveFilter((f) => ({
                        ...f,
                        tasteTags: f.tasteTags.filter((v) => v !== id),
                      })),
                  },
                ];
              }),
              ...activeFilters.categoryIds.flatMap((id) => {
                const cat = categories.find(
                  (c) => c.categoryId.toString() === id
                );
                if (!cat) return [];
                return [
                  {
                    key: `cat-${id}`,
                    label: cat.name,
                    onRemove: () =>
                      handleRemoveFilter((f) => ({
                        ...f,
                        categoryIds: f.categoryIds.filter((v) => v !== id),
                      })),
                  },
                ];
              }),
              ...(activeFilters.minPrice > DEFAULT_MIN_PRICE ||
              activeFilters.maxPrice < DEFAULT_MAX_PRICE
                ? [
                    {
                      key: 'price',
                      label: `${activeFilters.minPrice === 0 ? '0₫' : `${(activeFilters.minPrice / 1000).toLocaleString('vi-VN')}K`} — ${activeFilters.maxPrice >= DEFAULT_MAX_PRICE ? '5M+' : `${(activeFilters.maxPrice / 1000).toLocaleString('vi-VN')}K`}`,
                      onRemove: () =>
                        handleRemoveFilter((f) => ({
                          ...f,
                          minPrice: DEFAULT_MIN_PRICE,
                          maxPrice: DEFAULT_MAX_PRICE,
                        })),
                    },
                  ]
                : []),
              ...(activeFilters.distance !== DEFAULT_DISTANCE
                ? [
                    {
                      key: 'distance',
                      label: `${activeFilters.distance}km`,
                      onRemove: () =>
                        handleRemoveFilter((f) => ({
                          ...f,
                          distance: DEFAULT_DISTANCE,
                        })),
                    },
                  ]
                : []),
            ]}
            renderItem={({ item }) => (
              <FilterChip label={item.label} onRemove={item.onRemove} />
            )}
          />
        )}

        {/* Results List */}
        <View className="flex-1 px-4">
          <FlatList
            data={hasSearched ? stalls : []}
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
        onClose={() => {
          setFilterModalVisible(false);
          setFilterSection(null);
        }}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
        initialSection={filterSection}
      />
    </SafeAreaView>
  );
};
