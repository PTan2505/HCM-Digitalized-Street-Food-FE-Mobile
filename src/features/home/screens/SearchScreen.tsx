import SamplePlace from '@assets/SamplePlace.jpg';
import CurrentPickCard from '@features/home/components/CurrentPickCard';
import SearchBar from '@features/home/components/SearchBar';
import FilterModal, {
  type FilterState,
} from '@features/home/components/FilterModal';
import type { JSX } from 'react';
import { useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface FilterButton {
  id: string;
  label: string;
  type: 'toggle' | 'modal';
}

interface RestaurantItem {
  id: string;
  name: string;
  rating: number;
  distance: string;
  priceRange: string;
  tag: string;
  image: ImageSourcePropType;
  likes: number;
  comments: number;
  isTopPick?: boolean;
}

const FILTER_BUTTONS: FilterButton[] = [
  { id: 'all', label: 'Tất cả', type: 'toggle' },
  { id: 'vegetarian', label: 'Món chay', type: 'toggle' },
  { id: 'space', label: 'Không gian', type: 'toggle' },
  { id: 'dish', label: 'Loại món', type: 'toggle' },
];

const SAMPLE_RESTAURANTS: RestaurantItem[] = [
  {
    id: '1',
    name: 'Tiệm mỳ Chan Chan',
    rating: 4.5,
    distance: '1.2 km',
    priceRange: 'Từ 150k đến 200k',
    tag: 'Món chay',
    image: SamplePlace,
    likes: 120,
    comments: 45,
    isTopPick: false,
  },
  // Thêm các mẫu khác nếu cần
];

const SearchScreen = (): JSX.Element => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredRestaurants] = useState<RestaurantItem[]>(SAMPLE_RESTAURANTS);

  // Modal states
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const handleSearch = (text: string): void => {
    // TODO: Implement search logic
    console.log('Searching for:', text);
  };

  const handleFilterPress = (filterId: string): void => {
    setSelectedFilter(filterId);
    console.log('Selected filter:', filterId);
  };

  const handleFilterApply = (filters: FilterState): void => {
    console.log('Applied filters:', filters);
    setFilterModalVisible(false);
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

  const renderRestaurant = ({
    item,
  }: {
    item: RestaurantItem;
  }): JSX.Element => {
    return (
      <CurrentPickCard
        id={item.id}
        name={item.name}
        rating={item.rating}
        distance={item.distance}
        priceRange={item.priceRange}
        tag={item.tag}
        image={item.image}
        likes={item.likes}
        comments={item.comments}
        isTopPick={item.isTopPick}
        onPress={() => console.log('Restaurant pressed:', item.id)}
        onBookmarkPress={() => console.log('Bookmark pressed:', item.id)}
      />
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-1">
        {/* Search Bar with icons */}
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

        {/* Filter Buttons */}
        <View className="px-4">
          <FlatList
            data={FILTER_BUTTONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderFilterButton}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </View>

        {/* Restaurant List */}
        <View className="flex-1 px-4">
          <FlatList
            data={filteredRestaurants}
            keyExtractor={(item) => item.id}
            renderItem={renderRestaurant}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-gray-400">
                  Không tìm thấy kết quả nào
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {/* Modals */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
