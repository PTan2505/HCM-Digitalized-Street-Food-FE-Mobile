import optionIcon from '@assets/icons/option.svg';
import { FilterChipBar } from '@components/FilterChipBar';
import SvgIcon from '@components/SvgIcon';
import { COLORS } from '@constants/colors';
import type { FilterSection, FilterState } from '@custom-types/filter';
import { Ionicons } from '@expo/vector-icons';
import type { AutocompletePrediction } from '@features/maps/services/geocoding';
import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  // Text input
  placeholder?: string;
  value?: string; // Controlled value
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void; // Submit callback (keyboard search/enter)
  autoFocus?: boolean;
  editable?: boolean;

  // Navigation
  showBackButton?: boolean;
  onBackPress?: () => void;
  onPress?: () => void; // Make entire bar clickable

  // Filter options
  showFilterButton?: boolean; // Simple filter icon button
  onFilterPress?: () => void;
  showFilterChipBar?: boolean; // FilterChipBar below search
  activeFilters?: FilterState | null;
  onOpenFilter?: (section: FilterSection) => void;
  ignoreDefaultDistance?: boolean;

  // Autocomplete
  predictions?: AutocompletePrediction[];
  showPredictions?: boolean;
  onSelectPrediction?: (prediction: AutocompletePrediction) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onPickOnMap?: () => void;

  // Search area button (MapScreen specific)
  showSearchAreaButton?: boolean;
  onSearchArea?: () => void;
  searchAreaButtonText?: string;
  topInset?: number; // For positioning search area button

  // Styling
  noMargin?: boolean;
}

const SearchBar = ({
  placeholder,
  value: controlledValue,
  onChangeText,
  onSearch,
  autoFocus = false,
  editable = true,
  showBackButton = false,
  onBackPress,
  onPress,
  showFilterButton = false,
  onFilterPress,
  showFilterChipBar = false,
  activeFilters,
  onOpenFilter,
  ignoreDefaultDistance = false,
  predictions = [],
  showPredictions = false,
  onSelectPrediction,
  onFocus,
  onBlur,
  onPickOnMap,
  showSearchAreaButton = false,
  onSearchArea,
  searchAreaButtonText = 'Tìm khu vực này',
  topInset = 0,
  noMargin = false,
}: SearchBarProps): JSX.Element => {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState('');
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Use controlled value if provided, otherwise use internal state
  const inputValue = controlledValue ?? internalValue;
  const setInputValue = onChangeText ?? setInternalValue;

  const handleClearInput = (): void => {
    setInputValue('');
  };

  return (
    <View className={noMargin ? '' : 'mx-4 mb-4'}>
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
      >
        <View className="flex-row items-center rounded-[50px] bg-white px-4 py-4 shadow-sm">
          {/* Back button */}
          {showBackButton && (
            <TouchableOpacity onPress={onBackPress} className="mr-2">
              <Ionicons name="chevron-back" size={22} color="#333" />
            </TouchableOpacity>
          )}

          {/* Search icon */}
          <Ionicons name="search" size={20} color="#588d22" />

          {/* Text input */}
          <TextInput
            placeholder={placeholder ?? t('search_placeholder')}
            placeholderTextColor="#9CA3AF"
            onChangeText={setInputValue}
            value={inputValue}
            className="ml-3 flex-1 text-gray-900"
            editable={editable && !onPress}
            pointerEvents={onPress ? 'none' : 'auto'}
            textAlignVertical="center"
            autoFocus={autoFocus}
            onFocus={onFocus}
            onBlur={onBlur}
            returnKeyType="search"
            onSubmitEditing={() => onSearchRef.current?.(inputValue)}
          />

          {/* Clear button (inline) */}
          {inputValue.length > 0 && (
            <TouchableOpacity onPress={handleClearInput} className="ml-2">
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {/* Filter button (simple icon) */}
          {showFilterButton && (
            <TouchableOpacity
              className="ml-2 border-l-[1px] border-gray-300 pl-2"
              onPress={onFilterPress}
            >
              <SvgIcon icon={optionIcon} width={20} height={20} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Filter chip bar (below search input) */}
      {showFilterChipBar && onOpenFilter && (
        <View className="mt-2">
          <FilterChipBar
            activeFilters={activeFilters ?? null}
            onOpenFilter={onOpenFilter}
            ignoreDefaultDistance={ignoreDefaultDistance}
          />
        </View>
      )}

      {/* Autocomplete dropdown */}
      {showPredictions && predictions.length > 0 && (
        <View className="mt-1 rounded-xl border border-gray-200 bg-white shadow-lg">
          {predictions.map((p) => (
            <TouchableOpacity
              key={p.placeId}
              className="border-b border-gray-100 px-4 py-3"
              onPress={() => onSelectPrediction?.(p)}
            >
              <Text className="text-base font-medium text-gray-900">
                {p.mainText}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {p.secondaryText}
              </Text>
            </TouchableOpacity>
          ))}
          {onPickOnMap && (
            <TouchableOpacity
              className="flex-row items-center gap-3 px-4 py-3"
              onPress={onPickOnMap}
            >
              <Ionicons name="map-outline" size={16} color="#588d22" />
              <Text className="text-base font-medium text-primary">
                {t('map.pick_on_map')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* "Search this area" button (MapScreen specific) */}
      {showSearchAreaButton && (
        <View
          style={{
            position: 'absolute',
            top: topInset + 60,
            alignSelf: 'center',
            zIndex: 20,
          }}
        >
          <TouchableOpacity
            onPress={onSearchArea}
            className="flex-row items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-lg"
          >
            <Ionicons name="refresh" size={14} color={COLORS.primary} />
            <Text className="text-base font-semibold text-primary">
              {searchAreaButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SearchBar;
