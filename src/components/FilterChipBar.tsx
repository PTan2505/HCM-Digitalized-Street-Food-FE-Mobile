import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import type { FilterSection, FilterState } from '@custom-types/filter';

import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

interface FilterChipBarProps {
  activeFilters: FilterState | null;
  onOpenFilter: (section: FilterSection) => void;
  ignoreDefaultDistance?: boolean;
}

export const FilterChipBar = ({
  activeFilters,
  onOpenFilter,
  ignoreDefaultDistance = false,
}: FilterChipBarProps): JSX.Element => {
  const { t } = useTranslation();

  const isActive = (section: FilterSection): boolean => {
    if (!activeFilters) return false;
    switch (section) {
      case 'category':
        return activeFilters.categoryIds.length > 0;
      case 'priceRange':
        return activeFilters.minPrice > 0 || activeFilters.maxPrice < 5000000;
      case 'distance':
        return ignoreDefaultDistance || activeFilters.distance !== 5;
      case 'dietary':
        return activeFilters.dietaryTags.length > 0;
      case 'taste':
        return activeFilters.tasteTags.length > 0;
      default:
        return false;
    }
  };

  const chipClass = (section: FilterSection): string =>
    `flex-row items-center rounded-full border px-4 py-2 ${
      isActive(section)
        ? 'border-[#06AA4C] bg-[#E8F8F0]'
        : 'border-gray-300 bg-white'
    }`;

  const textClass = (section: FilterSection): string =>
    `ml-2 text-sm font-medium ${
      isActive(section) ? 'text-[#06AA4C]' : 'text-gray-600'
    }`;

  const iconColor = (section: FilterSection): string =>
    isActive(section) ? '#06AA4C' : '#6B7280';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 12,
        gap: 10,
      }}
      style={{ flexGrow: 0 }}
      className="mb-2 py-1"
    >
      <TouchableOpacity
        onPress={() => onOpenFilter('dietary')}
        className={chipClass('dietary')}
      >
        <Ionicons name="nutrition" size={18} color={iconColor('dietary')} />
        <Text className={textClass('dietary')}>{t('dietary_preferences')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onOpenFilter('taste')}
        className={chipClass('taste')}
      >
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={18}
          color={iconColor('taste')}
        />
        <Text className={textClass('taste')}>{t('taste_profile')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onOpenFilter('category')}
        className={chipClass('category')}
      >
        <MaterialIcons
          name="fastfood"
          size={18}
          color={iconColor('category')}
        />
        <Text className={textClass('category')}>{t('dish_type')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onOpenFilter('priceRange')}
        className={chipClass('priceRange')}
      >
        <MaterialCommunityIcons
          name="cash"
          size={18}
          color={iconColor('priceRange')}
        />
        <Text className={textClass('priceRange')}>{t('price_range')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onOpenFilter('distance')}
        className={chipClass('distance')}
      >
        <MaterialCommunityIcons
          name="map-marker-distance"
          size={18}
          color={iconColor('distance')}
        />
        <Text className={textClass('distance')}>{t('distance')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
