import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

interface CategoryChipsProps {
  categories: string[];
  selected: string | null;
  onSelect: (cat: string | null) => void;
}

export const CategoryChips = ({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        alignItems: 'center',
      }}
      style={{ flexGrow: 0 }}
    >
      <TouchableOpacity
        onPress={() => onSelect(null)}
        className={`rounded-full border px-4 py-2 ${
          selected === null
            ? 'border-[#006a2c] bg-[#006a2c]'
            : 'border-gray-200 bg-white'
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            selected === null ? 'text-[#ceffd0]' : 'text-gray-600'
          }`}
        >
          {t('manager_menu.all_categories')}
        </Text>
      </TouchableOpacity>

      {categories.map((cat) => {
        const active = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onSelect(active ? null : cat)}
            className={`rounded-full border px-4 py-2 ${
              active
                ? 'border-[#006a2c] bg-[#006a2c]'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${active ? 'text-[#ceffd0]' : 'text-gray-600'}`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
