import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import Slider from '@react-native-community/slider';
import { useCategories } from '@features/home/hooks/useCategories';
import {
  getAllDietaryPreferences,
  selectDietaryPreferences,
  selectDietaryState,
  selectUserDietaryPreferences,
} from '@slices/dietary';
import { fetchTastes, selectTastes, selectTastesStatus } from '@slices/tastes';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CategoryCard from './CategoryCard';

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
  tasteTags: string[];
  dietaryTags: string[];
}

const FilterModal = ({
  visible,
  onClose,
  onApply,
}: FilterModalProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [spaceTypes, setSpaceTypes] = useState<string[]>([]);
  const [dishTypes, setDishTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [distance, setDistance] = useState<number>(5);
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [tasteTags, setTasteTags] = useState<string[]>([]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const { categories } = useCategories();
  const tastes = useAppSelector(selectTastes);
  const tastesStatus = useAppSelector(selectTastesStatus);
  const dietaryPreferences = useAppSelector(selectDietaryPreferences);
  const dietaryStatus = useAppSelector(selectDietaryState);
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);

  // Pre-select the user's saved dietary prefs each time the modal opens
  useEffect(() => {
    if (visible) {
      setDietaryTags(
        userDietaryPreferences.map((p) => p.dietaryPreferenceId.toString())
      );
    }
  }, [visible, userDietaryPreferences]);

  useEffect(() => {
    if (tastesStatus === 'idle') {
      dispatch(fetchTastes());
    }
    if (dietaryPreferences.length === 0 && dietaryStatus !== 'pending') {
      dispatch(getAllDietaryPreferences());
    }
  }, [dispatch, tastesStatus, dietaryStatus, dietaryPreferences.length]);

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
    setTasteTags([]);
    // Restore to user's profile dietary prefs, not empty
    setDietaryTags(
      userDietaryPreferences.map((p) => p.dietaryPreferenceId.toString())
    );
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
      tasteTags,
      dietaryTags,
    });
    onClose();
  };

  const spaceOptions = [
    { key: 'restaurant', label: t('space_types.restaurant') },
    { key: 'cafe', label: t('space_types.cafe') },
    { key: 'casual', label: t('space_types.casual') },
    { key: 'takeaway', label: t('space_types.takeaway') },
    { key: 'food_court', label: t('space_types.food_court') },
    { key: 'food_street', label: t('space_types.food_street') },
  ];

  const priceOptions = [
    { key: 'any', label: t('price_options.any') },
    { key: 'under_50', label: t('price_options.under_50') },
    { key: 'range_50_150', label: t('price_options.range_50_150') },
    { key: 'range_150_300', label: t('price_options.range_150_300') },
    { key: 'over_300', label: t('price_options.over_300') },
  ];

  const tasteOptions = tastes.map((taste) => ({
    key: taste.tasteId.toString(),
    label: taste.name,
  }));

  const dietaryOptions = dietaryPreferences.map((pref) => ({
    key: pref.dietaryPreferenceId.toString(),
    label: pref.name,
  }));

  const amenityOptions = [
    { key: 'vegetarian', label: t('amenities.vegetarian') },
    { key: 'hygiene', label: t('amenities.hygiene') },
    { key: 'michelin', label: t('amenities.michelin') },
    { key: 'air_conditioned', label: t('amenities.air_conditioned') },
    { key: 'wifi', label: t('amenities.wifi') },
    { key: 'pet_friendly', label: t('amenities.pet_friendly') },
    { key: 'delivery', label: t('amenities.delivery') },
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
            <Text className="text-xl font-semibold text-gray-900">
              {t('filter')}
            </Text>
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
            {/* Taste Profile */}
            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                {t('taste_profile')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {tasteOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      toggleSelection(option.key, tasteTags, setTasteTags)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      tasteTags.includes(option.key)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        tasteTags.includes(option.key)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                {t('space')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {spaceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      toggleSelection(option.key, spaceTypes, setSpaceTypes)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      spaceTypes.includes(option.key)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        spaceTypes.includes(option.key)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="border-b border-gray-100 py-5">
              <Text className="mb-4 px-6 text-base font-semibold text-gray-900">
                {t('dish_type')}
              </Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.categoryId.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                renderItem={({ item }) => (
                  <CategoryCard
                    title={item.name}
                    image={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=a1d973&color=fff&size=160`}
                    onPress={() => console.log(`Selected ${item.name}`)}
                  />
                )}
              />
            </View>

            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                {t('price_range')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {priceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      toggleSelection(option.key, priceRange, setPriceRange)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      priceRange.includes(option.key)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        priceRange.includes(option.key)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Khoảng cách */}
            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-4 text-base font-semibold text-gray-900">
                {t('distance')}
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
                <Text className="text-sm text-gray-700">
                  {t('has_parking')}
                </Text>
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
                {t('time_slot')}
              </Text>
              <TouchableOpacity
                onPress={() => setOpenNow(!openNow)}
                className="flex-row items-center justify-between"
              >
                <Text className="flex-1 text-sm text-gray-700">
                  {t('show_open_only')}
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

            {/* Dietary Preferences */}
            <View className="border-b border-gray-100 px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                {t('dietary_preferences')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      toggleSelection(option.key, dietaryTags, setDietaryTags)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      dietaryTags.includes(option.key)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        dietaryTags.includes(option.key)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="px-6 py-5">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                {t('other_amenities')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {amenityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      toggleSelection(option.key, amenities, setAmenities)
                    }
                    className={`rounded-full border px-4 py-2 ${
                      amenities.includes(option.key)
                        ? 'border-[#06AA4C] bg-[#06AA4C]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        amenities.includes(option.key)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
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
                {t('reset')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 rounded-full bg-[#06AA4C] py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                {t('apply')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
