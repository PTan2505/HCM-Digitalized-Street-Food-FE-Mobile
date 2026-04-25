import { FilterChipBar } from '@components/FilterChipBar';
import SearchBar from '@components/SearchBar';
import { COLORS } from '@constants/colors';
import type { FilterSection, FilterState } from '@custom-types/filter';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BranchSiblingsSheet } from '@features/customer/home/components/common/BranchSiblingsSheet';
import FilterModal from '@features/customer/home/components/common/FilterModal';
import SearchResultCard from '@features/customer/home/components/common/SearchResultCard';
import { useCategories } from '@features/customer/home/hooks/useCategories';
import { useDishKeywords } from '@features/customer/home/hooks/useDishKeywords';
import { useSearchHistory } from '@features/customer/home/hooks/useSearchHistory';
import { useStallSearch } from '@features/customer/home/hooks/useStallSearch';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { useLocationPermission } from '@features/customer/maps/hooks/useLocationPermission';
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
import { registerCallback } from '@utils/callbackRegistry';
import { normalizeForMatch } from '@utils/normalizeText';
import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  InteractionManager,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type SearchScreenProps = StaticScreenProps<{
  autoFocus?: boolean;
  openFilter?: boolean;
  selectedCategoryId?: string;
}>;

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 5000000;
const DEFAULT_DISTANCE = 50;

const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}): JSX.Element => (
  <View className="mr-2 flex-row items-center rounded-full bg-[#E8F8F0] px-3 py-1">
    <Text className="mr-1 text-base font-medium text-primary-dark">
      {label}
    </Text>
    <TouchableOpacity onPress={onRemove} hitSlop={6}>
      <Ionicons name="close" size={14} color={COLORS.primaryDark} />
    </TouchableOpacity>
  </View>
);

const HighlightedText = ({
  text,
  query,
}: {
  text: string;
  query: string;
}): JSX.Element => {
  const normText = normalizeForMatch(text);
  const normQuery = normalizeForMatch(query);
  const idx = normQuery ? normText.indexOf(normQuery) : -1;
  if (idx === -1) {
    return <Text className="text-base text-gray-800">{text}</Text>;
  }

  const matchLen = normQuery.length;
  return (
    <Text className="text-base text-gray-800">
      {text.slice(0, idx)}
      <Text className="font-bold text-gray-900">
        {text.slice(idx, idx + matchLen)}
      </Text>
      {text.slice(idx + matchLen)}
    </Text>
  );
};

const SuggestionPanel = ({
  suggestions,
  query,
  onSelect,
}: {
  suggestions: string[];
  query: string;
  onSelect: (kw: string) => void;
}): JSX.Element => (
  <View className="pt-2">
    {suggestions.map((kw) => (
      <TouchableOpacity
        key={kw}
        className="flex-row items-center gap-3 border-b border-gray-100 py-3"
        onPress={() => onSelect(kw)}
      >
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <HighlightedText text={kw} query={query} />
      </TouchableOpacity>
    ))}
  </View>
);

const SkeletonBox = ({
  width,
  height,
  opacity,
  className: cls,
}: {
  width?: number | `${number}%`;
  height: number;
  opacity: SharedValue<number>;
  className?: string;
}): JSX.Element => {
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 6, backgroundColor: '#E5E7EB' },
        style,
      ]}
      className={cls}
    />
  );
};

const SearchResultSkeleton = ({
  opacity,
}: {
  opacity: SharedValue<number>;
}): JSX.Element => (
  <View className="mb-3 overflow-hidden rounded-[16px] border border-[#ededed] bg-white">
    {/* Top row */}
    <View className="flex-row">
      {/* Image placeholder */}
      <SkeletonBox width={120} height={130} opacity={opacity} />

      {/* Info column */}
      <View className="flex-1 gap-2 px-3 py-2.5">
        <SkeletonBox width="70%" height={14} opacity={opacity} />
        <SkeletonBox width="50%" height={12} opacity={opacity} />
        <SkeletonBox width="80%" height={11} opacity={opacity} />
        <SkeletonBox
          width={48}
          height={20}
          opacity={opacity}
          className="rounded-full"
        />
      </View>
    </View>

    {/* Dish tile row */}
    <View className="flex-row gap-2.5 border-t border-[#f0f0f0] px-3 pb-3 pt-2.5">
      {[0, 1, 2].map((i) => (
        <View key={i} className="gap-1.5">
          <SkeletonBox
            width={96}
            height={80}
            opacity={opacity}
            className="rounded-xl"
          />
          <SkeletonBox width={60} height={11} opacity={opacity} />
          <SkeletonBox width={80} height={11} opacity={opacity} />
        </View>
      ))}
    </View>
  </View>
);

const SearchSkeletonList = (): JSX.Element => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      false
    );
  }, [opacity]);

  return (
    <View className="pb-4 pt-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <SearchResultSkeleton
          key={`search-skeleton-${idx}`}
          opacity={opacity}
        />
      ))}
    </View>
  );
};

export const SearchScreen = ({ route }: SearchScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const { autoFocus, openFilter, selectedCategoryId } = route?.params ?? {};
  const [keyword, setKeyword] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterSection, setFilterSection] = useState<FilterSection | null>(
    null
  );
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(Boolean(autoFocus));
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const branchImageMap = useAppSelector(selectBranchImageMap);
  const reduxMultiBranchVendorIds = useAppSelector(selectMultiBranchVendorIds);
  const dietaryPreferences = useAppSelector(selectDietaryPreferences);
  const tastes = useAppSelector(selectTastes);
  const { categories } = useCategories();
  const { history, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();

  useEffect(() => {
    if (!openFilter) return;
    const task = InteractionManager.runAfterInteractions(() => {
      setFilterModalVisible(true);
    });
    return (): void => task.cancel();
  }, [openFilter]);

  const { coords } = useLocationPermission();
  const dishKeywords = useDishKeywords();
  const {
    stalls,
    imageMap: searchImageMap,
    isLoading,
    error,
    search,
    clearError,
  } = useStallSearch();

  const multiBranchVendorIds = useMemo(() => {
    const vendorCounts = new Map<number, number>();
    for (const stall of stalls) {
      if (stall.vendorId == null) continue;
      vendorCounts.set(
        stall.vendorId,
        (vendorCounts.get(stall.vendorId) ?? 0) + 1
      );
    }
    const fromSearch = Array.from(vendorCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([vendorId]) => vendorId);
    return [...new Set([...reduxMultiBranchVendorIds, ...fromSearch])];
  }, [stalls, reduxMultiBranchVendorIds]);

  const triggerSearch = useCallback(
    (kw: string, filters: FilterState | null) => {
      const hasDistanceFilter =
        filters?.distance !== undefined &&
        filters.distance !== DEFAULT_DISTANCE;

      search({
        Keyword: kw || undefined,
        ...(coords
          ? {
              Lat: coords.latitude,
              Long: coords.longitude,
              Distance: hasDistanceFilter
                ? filters?.distance
                : DEFAULT_DISTANCE,
            }
          : {}),
        DietaryIds: filters?.dietaryTags
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        TasteIds: filters?.tasteTags
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        ...(filters?.minPrice !== undefined &&
        filters.minPrice > DEFAULT_MIN_PRICE
          ? { MinPrice: filters.minPrice }
          : {}),
        ...(filters?.maxPrice !== undefined &&
        filters.maxPrice < DEFAULT_MAX_PRICE
          ? { MaxPrice: filters.maxPrice }
          : {}),
        CategoryIds: filters?.categoryIds
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0),
        Wards: filters?.wards?.length ? filters.wards : undefined,
      });
    },
    [coords, search]
  );

  const suggestions = useMemo(() => {
    const q = normalizeForMatch(keyword.trim());
    if (!q) return [];
    const historyMatches = history.filter(
      (h) => normalizeForMatch(h).includes(q) && normalizeForMatch(h) !== q
    );
    const categoryMatches = categories
      .map((c) => c.name)
      .filter((name) => normalizeForMatch(name).includes(q));
    const dishMatches = dishKeywords.filter(
      (name) =>
        normalizeForMatch(name).includes(q) && normalizeForMatch(name) !== q
    );
    return [
      ...new Set([...historyMatches, ...categoryMatches, ...dishMatches]),
    ].slice(0, 6);
  }, [keyword, history, categories, dishKeywords]);

  const showSuggestions =
    isInputFocused && keyword.trim().length > 0 && suggestions.length > 0;

  // Real-time keyword update (no debounce) — feeds suggestion matching
  const handleChangeText = (text: string): void => {
    setKeyword(text);
    if (!text.trim() && !activeFilters) setHasSearched(false);
  };

  // Submit callback from SearchBar — triggers actual API call on Enter/Search
  const handleSubmitSearch = (text: string): void => {
    if (!text.trim() && !activeFilters) {
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    if (text.trim()) addToHistory(text.trim());
    triggerSearch(text, activeFilters);
  };

  // Shared handler for tapping a history item or suggestion
  const handleKeywordSelect = (kw: string): void => {
    setKeyword(kw);
    setHasSearched(true);
    setIsInputFocused(false);
    Keyboard.dismiss();
    addToHistory(kw);
    triggerSearch(kw, activeFilters);
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
      updated.distance !== DEFAULT_DISTANCE ||
      (updated.wards?.length ?? 0) > 0;
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

  const [siblingsSheetBranch, setSiblingsSheetBranch] =
    useState<ActiveBranch | null>(null);

  const navigateToBranch = useCallback(
    (branch: ActiveBranch, displayName: string) => {
      navigation.navigate('RestaurantDetails', {
        branch,
        displayName,
        onRatingUpdateId: registerCallback((avgRating, totalReviewCount) =>
          handleRatingUpdate(branch.branchId, avgRating, totalReviewCount)
        ),
      });
    },
    [navigation, handleRatingUpdate]
  );

  const showHistory =
    !hasSearched &&
    !keyword.trim() &&
    activeFilters == null &&
    history.length > 0;

  const renderEmptyOrError = (): JSX.Element => {
    if (!hasSearched) return <View />;

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
            className="mt-4 rounded-full bg-primary-dark px-6 py-2"
          >
            <Text className="text-base font-semibold text-white">
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
          <Text className="mt-1 text-center text-base text-gray-400">
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
      activeFilters.distance !== DEFAULT_DISTANCE ||
      (activeFilters.wards?.length ?? 0) > 0);

  useEffect(() => {
    if (!selectedCategoryId) return;

    const categoryFilter: FilterState = {
      spaceTypes: [],
      categoryIds: [selectedCategoryId],
      minPrice: DEFAULT_MIN_PRICE,
      maxPrice: DEFAULT_MAX_PRICE,
      distance: DEFAULT_DISTANCE,
      hasParking: false,
      openNow: false,
      amenities: [],
      tasteTags: [],
      dietaryTags: [],
      wards: [],
    };

    setActiveFilters(categoryFilter);
    setHasSearched(true);
    triggerSearch('', categoryFilter);
  }, [selectedCategoryId, triggerSearch]);

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
              value={keyword}
              onChangeText={handleChangeText}
              onSearch={handleSubmitSearch}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              showFilterButton
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
            onPress={() => navigation.navigate('Map', {})}
          >
            <Ionicons name="map-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Filter category chips */}
        <FilterChipBar
          activeFilters={activeFilters}
          onOpenFilter={(section) => {
            setFilterSection(section);
            setFilterModalVisible(true);
          }}
          defaultDistance={DEFAULT_DISTANCE}
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
              ...(activeFilters.wards ?? []).map((w) => ({
                key: `ward-${w}`,
                label: w,
                onRemove: () =>
                  handleRemoveFilter((f) => ({
                    ...f,
                    wards: (f.wards ?? []).filter((v) => v !== w),
                  })),
              })),
            ]}
            renderItem={({ item }) => (
              <FilterChip label={item.label} onRemove={item.onRemove} />
            )}
          />
        )}

        {/* Suggestions / Results */}
        <View className="flex-1 px-4">
          {showHistory ? (
            <View className="pt-2">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-700">
                  {t('search.history_title')}
                </Text>
              </View>
              {history.map((kw) => (
                <TouchableOpacity
                  key={kw}
                  className="flex-row items-center justify-between border-b border-gray-100 py-3"
                  onPress={() => handleKeywordSelect(kw)}
                >
                  <View className="flex-row items-center gap-3">
                    <FontAwesome5 name="history" size={18} color="black" />
                    <Text className="text-lg text-gray-800">{kw}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromHistory(kw)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : showSuggestions ? (
            <SuggestionPanel
              suggestions={suggestions}
              query={keyword.trim()}
              onSelect={handleKeywordSelect}
            />
          ) : isLoading && hasSearched ? (
            <SearchSkeletonList />
          ) : (
            <FlatList
              data={hasSearched ? stalls : []}
              keyExtractor={(item) =>
                item.vendorId != null
                  ? `v-${item.vendorId}`
                  : `b-${item.branchId}`
              }
              renderItem={({ item }) => {
                const hasSiblings = (item.otherBranches?.length ?? 0) > 0;
                const isMultiBranch =
                  hasSiblings ||
                  (item.vendorId != null &&
                    multiBranchVendorIds.includes(item.vendorId));
                const displayName = computeDisplayName(
                  item,
                  isMultiBranch,
                  t('branch')
                );
                return (
                  <SearchResultCard
                    branch={item}
                    imageUri={
                      searchImageMap[item.branchId] ??
                      branchImageMap[item.branchId]?.[0]
                    }
                    displayName={displayName}
                    onPress={() => navigateToBranch(item, displayName)}
                    onSiblingsPress={
                      hasSiblings
                        ? (): void => setSiblingsSheetBranch(item)
                        : undefined
                    }
                  />
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 16, flexGrow: 1 }}
              ListEmptyComponent={renderEmptyOrError}
            />
          )}
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

      <BranchSiblingsSheet
        visible={siblingsSheetBranch !== null}
        vendorName={siblingsSheetBranch?.vendorName ?? ''}
        siblings={siblingsSheetBranch?.otherBranches ?? []}
        imageMap={searchImageMap}
        onClose={() => setSiblingsSheetBranch(null)}
        onSelectBranch={(sibling) => {
          const displayName = computeDisplayName(sibling, false, t('branch'));
          navigateToBranch(sibling, displayName);
        }}
      />
    </SafeAreaView>
  );
};
