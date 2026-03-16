import { Ionicons } from '@expo/vector-icons';
import FilterModal, {
  type FilterState,
} from '@features/home/components/common/FilterModal';
import SearchBar from '@features/home/components/common/SearchBar';
import SearchResultCard from '@features/home/components/common/SearchResultCard';
import { useStallSearch } from '@features/home/hooks/useStallSearch';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FilterButton {
  id: string;
  label: string;
}

export const SearchScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  const { coords } = useLocationPermission();
  const { stalls, isLoading, error, search, clearError } = useStallSearch();

  const filterButtons: FilterButton[] = [
    { id: 'all', label: t('actions.all') },
    { id: 'spicy', label: t('taste_tags.spicy') },
    { id: 'sweet', label: t('taste_tags.sweet') },
    { id: 'vegetarian', label: t('amenities.vegetarian') },
  ];

  const priceRangeToParams = (
    keys: string[]
  ): { MinPrice?: number; MaxPrice?: number } => {
    const key = keys[0];
    if (!key || key === 'any') return {};
    if (key === 'under_50') return { MaxPrice: 50000 };
    if (key === 'range_50_150') return { MinPrice: 50000, MaxPrice: 150000 };
    if (key === 'range_150_300') return { MinPrice: 150000, MaxPrice: 300000 };
    if (key === 'over_300') return { MinPrice: 300000 };
    return {};
  };

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
        ...priceRangeToParams(filters?.priceRange ?? []),
      });
    },
    [coords, search]
  );

  const handleSearch = (text: string): void => {
    setKeyword(text);
    triggerSearch(text, activeFilters);
  };

  const handleFilterPress = (filterId: string): void => {
    setSelectedFilter(filterId);
    if (filterId === 'all') {
      triggerSearch(keyword, activeFilters);
    } else {
      const quickFilters: FilterState = {
        spaceTypes: [],
        dishTypes: [],
        priceRange: [],
        distance: 5,
        hasParking: false,
        openNow: false,
        amenities: [],
        tasteTags: ['spicy', 'sweet'].includes(filterId) ? [filterId] : [],
        dietaryTags: filterId === 'vegetarian' ? ['vegetarian'] : [],
      };
      triggerSearch(keyword, quickFilters);
    }
  };

  const handleFilterApply = (filters: FilterState): void => {
    setActiveFilters(filters);
    setFilterModalVisible(false);
    triggerSearch(keyword, filters);
  };

  const renderFilterButton = ({
    item,
  }: {
    item: FilterButton;
  }): JSX.Element => {
    const isSelected = item.id === selectedFilter;
    return (
      <TouchableOpacity
        onPress={() => handleFilterPress(item.id)}
        className={`mr-2 flex-row items-center rounded-[50px] px-4 py-2 ${
          isSelected ? 'bg-[#06AA4C]' : 'border border-gray-300 bg-white'
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            isSelected ? 'text-white' : 'text-gray-700'
          }`}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyOrError = (): JSX.Element => {
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
    if (stalls.length === 0 && keyword.length > 0) {
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
            />
          </View>
          <TouchableOpacity className="items-center justify-center">
            <Ionicons name="map-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center justify-center">
            <Ionicons name="bookmark-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Quick Filter Buttons */}
        <View className="px-4">
          <FlatList
            data={filterButtons}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderFilterButton}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </View>

        {/* Results List */}
        <View className="flex-1 px-4">
          <FlatList
            data={stalls}
            keyExtractor={(item) => String(item.branchId)}
            renderItem={({ item }) => <SearchResultCard branch={item} />}
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
