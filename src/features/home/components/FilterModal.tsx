import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import type { JSX } from 'react';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CategoryCard from './CategoryCard';
import { FOOD_CATEGORIES } from '../constants/categories';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  spaceTypes: string[];
  dishTypes: string[];
  priceRange: string[];
  distance: number;
  hasParking: boolean;
  openNow: boolean;
  amenities: string[];
}

const FilterModal = ({
  visible,
  onClose,
  onApply,
}: FilterModalProps): JSX.Element => {
  const [spaceTypes, setSpaceTypes] = useState<string[]>([]);
  const [dishTypes, setDishTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [distance, setDistance] = useState<number>(5);
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [amenities, setAmenities] = useState<string[]>([]);

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void
  ): void => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleReset = (): void => {
    setSpaceTypes([]);
    setDishTypes([]);
    setPriceRange([]);
    setDistance(5);
    setHasParking(false);
    setOpenNow(false);
    setAmenities([]);
  };

  const handleApply = (): void => {
    onApply({
      spaceTypes,
      dishTypes,
      priceRange,
      distance,
      hasParking,
      openNow,
      amenities,
    });
    onClose();
  };

  const spaceOptions = [
    'Nhà hàng',
    'Cafe',
    'Quán bình dân',
    'Mua mang về',
    'Khu ẩm thực',
    'Phố ẩm thực',
  ];

  const priceOptions = [
    'Bất kì',
    'Dưới 50,000',
    'Từ 50,000 - 150,000',
    'Từ 150,000 - 300,000',
    'Trên 300,000',
  ];

  const amenityOptions = [
    'Món chay',
    'Chứng nhận vệ sinh',
    'Michelin',
    'Có điều hòa',
    'Wifi',
    'Thân thiện với thú cưng',
    'Giao hàng',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-white" style={{ maxHeight: '90%' }}>
          <View className="items-center border-b border-gray-200 px-6 py-4">
            <Text className="text-xl font-semibold text-gray-900">Bộ lọc</Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-6 top-4"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Không gian
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {spaceOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      toggleSelection(option, spaceTypes, setSpaceTypes)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      spaceTypes.includes(option)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        spaceTypes.includes(option)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="border-b border-gray-100 py-5">
              <Text className="mb-4 px-6 text-base font-semibold text-gray-900">
                Loại món
              </Text>
              <FlatList
                data={FOOD_CATEGORIES}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                renderItem={({ item }) => (
                  <CategoryCard
                    title={item.title}
                    image={item.image}
                    selected={dishTypes.includes(item.id)}
                    onPress={() =>
                      toggleSelection(item.id, dishTypes, setDishTypes)
                    }
                  />
                )}
              />
            </View>

            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Khoảng giá
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {priceOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      toggleSelection(option, priceRange, setPriceRange)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      priceRange.includes(option)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        priceRange.includes(option)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Khoảng cách */}
            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-4 text-base font-semibold text-gray-900">
                Khoảng cách
              </Text>
              <View className="relative">
                {/* Track line with dots */}
                <View className="absolute left-0 right-0 top-[18px] flex-row items-center justify-between px-1">
                  {/* Green line from start to current position */}
                  <View
                    className="absolute left-0 h-1 bg-[#06AA4C]"
                    style={{
                      width: `${((distance - 1) / 9) * 100}%`,
                    }}
                  />
                  {/* Gray line for rest */}
                  <View
                    className="absolute right-0 h-1 bg-gray-300"
                    style={{
                      width: `${((10 - distance) / 9) * 100}%`,
                    }}
                  />
                  {/* Dots */}
                  {Array.from({ length: 10 }).map((_, index) => (
                    <View
                      key={index}
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          index < distance ? '#06AA4C' : '#D1D5DB',
                        zIndex: 1,
                      }}
                    />
                  ))}
                </View>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={distance}
                  onValueChange={setDistance}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="#06AA4C"
                />
              </View>
              <View className="mt-1 flex-row justify-between px-1">
                <Text className="text-xs text-gray-500">1km</Text>
                <Text className="text-xs text-gray-500">5km</Text>
                <Text className="text-xs text-gray-500">10km</Text>
              </View>
              <TouchableOpacity
                onPress={() => setHasParking(!hasParking)}
                className="mt-3 flex-row items-center justify-between"
              >
                <Text className="text-sm text-gray-700">Có chỗ để xe ô tô</Text>
                <View
                  className={`h-5 w-5 items-center justify-center rounded ${
                    hasParking
                      ? 'bg-[#06AA4C]'
                      : 'border border-gray-300 bg-white'
                  }`}
                >
                  {hasParking && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Khung giờ
              </Text>
              <TouchableOpacity
                onPress={() => setOpenNow(!openNow)}
                className="flex-row items-center justify-between"
              >
                <Text className="flex-1 text-sm text-gray-700">
                  Chỉ hiển thị những cửa hàng đang mở
                </Text>
                <View
                  className={`h-5 w-5 items-center justify-center rounded ${
                    openNow ? 'bg-[#06AA4C]' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {openNow && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View className="px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Tiện ích khác
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {amenityOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      toggleSelection(option, amenities, setAmenities)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      amenities.includes(option)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        amenities.includes(option)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="flex-row gap-3 border-t border-gray-200 px-8 py-6">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 rounded-full border border-gray-300 bg-white py-4"
            >
              <Text className="text-center text-base font-semibold text-gray-700">
                Thiết lập lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 rounded-full bg-[#06AA4C] py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
