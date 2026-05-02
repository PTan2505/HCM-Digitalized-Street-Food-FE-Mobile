import { AnimatedBackdrop } from '@components/AnimatedBackdrop';
import { COLORS } from '@constants/colors';
import { WARDS } from '@constants/wards';
import type { FilterSection, FilterState } from '@custom-types/filter';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '@features/customer/home/hooks/useCategories';
import { useTastes } from '@features/customer/home/hooks/useTastes';
import { useDietaryPreferenceQuery } from '@features/user/hooks/dietaryPreference/useDietaryPreferenceQuery';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import CategoryCard from './CategoryCard';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState | null;
  initialSection?: FilterSection | null;
}

const FilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  initialSection,
}: FilterModalProps): JSX.Element => {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const sliderWidth = screenWidth - 48; // px-6 = 24px each side
  const showSection = (section: FilterSection): boolean =>
    !initialSection || initialSection === section;
  const [spaceTypes, setSpaceTypes] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [distance, setDistance] = useState<number>(50);
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [tasteTags, setTasteTags] = useState<string[]>([]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [wardQuery, setWardQuery] = useState<string>('');
  const { categories } = useCategories();
  const { tastes } = useTastes();
  const { dietaryPreferences } = useDietaryPreferenceQuery();
  const [backdropVisible, setBackdropVisible] = useState(visible);
  const backdropProgress = useSharedValue(visible ? 1 : 0);
  const closeBackdropTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Sync internal state with external activeFilters when modal opens
  useEffect(() => {
    if (!visible) return;
    if (initialFilters) {
      setSpaceTypes(initialFilters.spaceTypes);
      setCategoryIds(initialFilters.categoryIds);
      setMinPrice(initialFilters.minPrice);
      setMaxPrice(initialFilters.maxPrice);
      setDistance(initialFilters.distance);
      setHasParking(initialFilters.hasParking);
      setOpenNow(initialFilters.openNow);
      setAmenities(initialFilters.amenities);
      setTasteTags(initialFilters.tasteTags);
      setDietaryTags(initialFilters.dietaryTags);
      setWards(initialFilters.wards ?? []);
      setWardQuery('');
    } else {
      setSpaceTypes([]);
      setCategoryIds([]);
      setMinPrice(0);
      setMaxPrice(5000000);
      setDistance(50);
      setHasParking(false);
      setOpenNow(false);
      setAmenities([]);
      setTasteTags([]);
      setDietaryTags([]);
      setWards([]);
      setWardQuery('');
    }
  }, [visible, initialFilters]);

  useEffect(() => {
    if (visible) {
      if (closeBackdropTimeoutRef.current) {
        clearTimeout(closeBackdropTimeoutRef.current);
        closeBackdropTimeoutRef.current = null;
      }
      setBackdropVisible(true);
      backdropProgress.value = withTiming(1, { duration: 220 });
      return;
    }

    backdropProgress.value = withTiming(0, { duration: 220 });
    closeBackdropTimeoutRef.current = setTimeout(() => {
      setBackdropVisible(false);
      closeBackdropTimeoutRef.current = null;
    }, 220);
  }, [backdropProgress, visible]);

  useEffect((): (() => void) => {
    return (): void => {
      if (closeBackdropTimeoutRef.current) {
        clearTimeout(closeBackdropTimeoutRef.current);
      }
    };
  }, []);

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
    setCategoryIds([]);
    setMinPrice(0);
    setMaxPrice(5000000);
    setDistance(50);
    setHasParking(false);
    setOpenNow(false);
    setAmenities([]);
    setTasteTags([]);
    // Restore to user's profile dietary prefs, not empty
    setDietaryTags([]);
    setWards([]);
    setWardQuery('');
  };

  const handleApply = (): void => {
    onApply({
      spaceTypes,
      categoryIds,
      minPrice,
      maxPrice,
      distance,
      hasParking,
      openNow,
      amenities,
      tasteTags,
      dietaryTags,
      wards,
    });
    onClose();
  };

  const tasteOptions = tastes.map((taste) => ({
    key: taste.tasteId.toString(),
    label: taste.name,
  }));

  const dietaryOptions = dietaryPreferences.map((pref) => ({
    key: pref.dietaryPreferenceId.toString(),
    label: pref.name,
  }));

  return (
    <>
      <AnimatedBackdrop
        mounted={backdropVisible}
        visible={visible}
        onPress={onClose}
        progress={backdropProgress}
      />

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white"
          style={{ maxHeight: '90%' }}
        >
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
            {/* Dietary Preferences */}
            {showSection('dietary') && (
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
                          ? 'border-primary-dark bg-primary-dark'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-base ${
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
            )}

            {/* Taste Profile */}
            {showSection('taste') && (
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
                          ? 'border-primary-dark bg-primary-dark'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-base ${
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
            )}

            {/* Category */}
            {showSection('category') && (
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
                      image={item.imageUrl ?? undefined}
                      onPress={() =>
                        toggleSelection(
                          item.categoryId.toString(),
                          categoryIds,
                          setCategoryIds
                        )
                      }
                      selected={categoryIds.includes(
                        item.categoryId.toString()
                      )}
                    />
                  )}
                />
              </View>
            )}

            {/* Price Range */}
            {showSection('priceRange') && (
              <View className="border-b border-gray-100 px-6 py-5">
                <View className="mb-5 flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-gray-900">
                    {t('price_range')}
                  </Text>
                  <View className="flex-row items-center rounded-full bg-[#E8F8F0] px-3 py-1">
                    <Text className="text-base font-semibold text-primary-dark">
                      {minPrice === 0
                        ? '0₫'
                        : `${minPrice.toLocaleString('vi-VN')}đ`}{' '}
                      —{' '}
                      {maxPrice >= 5000000
                        ? '5M+'
                        : `${maxPrice.toLocaleString('vi-VN')}đ`}
                    </Text>
                  </View>
                </View>
                <MultiSlider
                  values={[minPrice, maxPrice]}
                  min={0}
                  max={5000000}
                  step={10000}
                  onValuesChangeFinish={(values) => {
                    setMinPrice(values[0]);
                    setMaxPrice(values[1]);
                  }}
                  enableLabel
                  customLabel={({
                    oneMarkerLeftPosition,
                    twoMarkerLeftPosition,
                    oneMarkerValue,
                    twoMarkerValue,
                  }) => {
                    const minVal = Number(oneMarkerValue);
                    const maxVal = Number(twoMarkerValue);
                    return (
                      <View>
                        <View
                          style={{
                            position: 'absolute',
                            left: oneMarkerLeftPosition - 19,
                            bottom: 0,
                            backgroundColor: COLORS.primaryDark,
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: '600',
                            }}
                          >
                            {minVal === 0
                              ? '0₫'
                              : `${(minVal / 1000).toLocaleString('vi-VN')}K`}
                          </Text>
                        </View>
                        <View
                          style={{
                            position: 'absolute',
                            left: twoMarkerLeftPosition - 19,
                            bottom: 0,
                            backgroundColor: COLORS.primaryDark,
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: '600',
                            }}
                          >
                            {maxVal >= 5000000
                              ? '5M+'
                              : `${(maxVal / 1000).toLocaleString('vi-VN')}K`}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                  containerStyle={{
                    height: 60,
                    width: sliderWidth,
                  }}
                  sliderLength={sliderWidth}
                  trackStyle={{
                    height: 4,
                    borderRadius: 2,
                  }}
                  selectedStyle={{
                    backgroundColor: COLORS.primaryDark,
                  }}
                  unselectedStyle={{
                    backgroundColor: '#E5E7EB',
                  }}
                  markerStyle={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                    borderWidth: 2.5,
                    borderColor: COLORS.primaryDark,
                    shadowColor: COLORS.primaryDark,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  pressedMarkerStyle={{
                    height: 28,
                    width: 28,
                    borderRadius: 14,
                    borderWidth: 3,
                  }}
                />
                <View className="flex-row justify-between px-1">
                  <Text className="text-sm text-gray-400">0₫</Text>
                  <Text className="text-sm text-gray-400">1M</Text>
                  <Text className="text-sm text-gray-400">2M</Text>
                  <Text className="text-sm text-gray-400">3M</Text>
                  <Text className="text-sm text-gray-400">4M</Text>
                  <Text className="text-sm text-gray-400">5M+</Text>
                </View>
              </View>
            )}

            {/* Ward */}
            {showSection('ward') && (
              <View className="border-b border-gray-100 px-6 py-5">
                <Text className="mb-3 text-base font-semibold text-gray-900">
                  {t('ward_label')}
                </Text>

                {/* Selected ward chips */}
                {wards.length > 0 && (
                  <View className="mb-3 flex-row flex-wrap gap-2">
                    {wards.map((w) => (
                      <TouchableOpacity
                        key={w}
                        onPress={() => setWards(wards.filter((v) => v !== w))}
                        className="flex-row items-center rounded-full bg-primary-dark px-3 py-1.5"
                      >
                        <Text className="mr-1 text-sm font-semibold text-white">
                          {w}
                        </Text>
                        <Ionicons name="close" size={13} color="#fff" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Search input */}
                <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                  <TextInput
                    value={wardQuery}
                    onChangeText={setWardQuery}
                    placeholder={t('ward_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    className="ml-2 flex-1 text-sm text-gray-800"
                  />
                  {wardQuery !== '' && (
                    <TouchableOpacity
                      onPress={() => setWardQuery('')}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Checkbox list */}
                <View className="mt-1 max-h-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {WARDS.filter(
                      (w) =>
                        wardQuery.trim() === '' ||
                        w.toLowerCase().includes(wardQuery.trim().toLowerCase())
                    ).map((w) => {
                      const checked = wards.includes(w);
                      return (
                        <TouchableOpacity
                          key={w}
                          onPress={() =>
                            setWards(
                              checked
                                ? wards.filter((v) => v !== w)
                                : [...wards, w]
                            )
                          }
                          className="flex-row items-center border-b border-gray-50 px-4 py-3"
                        >
                          <View
                            className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
                              checked
                                ? 'border-primary-dark bg-primary-dark'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {checked && (
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color="#fff"
                              />
                            )}
                          </View>
                          <Text className="text-sm text-gray-800">{w}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Distance */}
            {showSection('distance') && (
              <View className="border-b border-gray-100 px-6 py-5">
                <View className="mb-5 flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-gray-900">
                    {t('distance')}
                  </Text>
                  <View className="flex-row items-center rounded-full bg-[#E8F8F0] px-3 py-1">
                    <Text className="text-base font-semibold text-primary-dark">
                      {distance} km
                    </Text>
                  </View>
                </View>
                <MultiSlider
                  values={[distance]}
                  min={1}
                  max={100}
                  step={1}
                  allowOverlap
                  snapped
                  onValuesChangeFinish={(values) => setDistance(values[0])}
                  enableLabel
                  customLabel={({ oneMarkerLeftPosition, oneMarkerValue }) => {
                    const val = Number(oneMarkerValue);
                    return (
                      <View>
                        <View
                          style={{
                            position: 'absolute',
                            left: oneMarkerLeftPosition - 19,
                            bottom: 0,
                            backgroundColor: COLORS.primaryDark,
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: '600',
                            }}
                          >
                            {val}km
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                  containerStyle={{
                    height: 60,
                    width: sliderWidth,
                  }}
                  sliderLength={sliderWidth}
                  trackStyle={{
                    height: 4,
                    borderRadius: 2,
                  }}
                  selectedStyle={{
                    backgroundColor: COLORS.primaryDark,
                  }}
                  unselectedStyle={{
                    backgroundColor: '#E5E7EB',
                  }}
                  markerStyle={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                    borderWidth: 2.5,
                    borderColor: COLORS.primaryDark,
                    shadowColor: COLORS.primaryDark,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  pressedMarkerStyle={{
                    height: 28,
                    width: 28,
                    borderRadius: 14,
                    borderWidth: 3,
                  }}
                />
                <View className="flex-row justify-between px-1">
                  <Text className="text-sm text-gray-400">1km</Text>
                  <Text className="text-sm text-gray-400">25km</Text>
                  <Text className="text-sm text-gray-400">50km</Text>
                  <Text className="text-sm text-gray-400">75km</Text>
                  <Text className="text-sm text-gray-400">100km</Text>
                </View>
              </View>
            )}
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
              className="flex-1 rounded-full bg-primary-dark py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                {t('apply')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FilterModal;
