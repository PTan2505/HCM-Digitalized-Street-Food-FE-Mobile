import type { Dish } from '@features/home/types/branch';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400';

interface MenuTabProps {
  dishes: Dish[];
}

const MenuTab = ({ dishes }: MenuTabProps): JSX.Element => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    'all'
  );

  const categories = ['all', ...new Set(dishes.map((d) => d.categoryName))];

  const filteredDishes =
    activeCategory === 'all'
      ? dishes
      : dishes.filter((d) => d.categoryName === activeCategory);

  const renderDish = (dish: Dish): JSX.Element => (
    <View key={dish.dishId} className="mb-4 flex-row">
      <Image
        source={{ uri: dish.imageUrl ?? PLACEHOLDER_IMAGE }}
        className="mr-3 h-[100px] w-[100px] rounded-lg bg-gray-100"
      />
      <View className="flex-1 justify-between">
        <Text className="mb-1 text-base font-semibold text-black">
          {dish.name}
        </Text>
        <Text
          className="text-[13px] font-semibold leading-[18px] text-gray-400"
          numberOfLines={2}
        >
          {dish.description}
        </Text>
        <Text className="text-base font-semibold text-[#00B14F]">
          {`${Math.round(dish.price / 1000)}k`}
        </Text>
        {dish.isSoldOut && (
          <Text className="text-xs text-red-400">{t('actions.sold_out')}</Text>
        )}
      </View>
    </View>
  );

  return (
    <>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-gray-200 px-4 pt-4"
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            className={`mr-2 flex-row items-center justify-center border-b-2 px-3 py-2 ${
              activeCategory === cat ? 'border-[#FF6B35]' : 'border-transparent'
            }`}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              className={`text-sm capitalize ${
                activeCategory === cat
                  ? 'font-semibold text-[#FF6B35]'
                  : 'text-black-400'
              }`}
            >
              {cat === 'all' ? t('actions.all') : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      {activeCategory === 'all' ? (
        <>
          {categories.map((cat) => {
            const group = dishes.filter(
              (d) => (d.categoryName ?? t('actions.other')) === cat
            );
            if (group.length === 0) return null;
            return (
              <View key={cat} className="border-b border-gray-200 p-4">
                <Text className="mb-4 text-lg font-bold capitalize text-black">
                  {cat}
                </Text>
                {group.map(renderDish)}
              </View>
            );
          })}
          {categories.length === 0 && (
            <View className="p-4">
              <Text className="py-8 text-center text-base text-gray-400">
                {t('actions.no_items')}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View className="border-b border-gray-200 p-4">
          {filteredDishes.length > 0 ? (
            filteredDishes.map(renderDish)
          ) : (
            <Text className="py-8 text-center text-base text-gray-400">
              {t('actions.no_items')}
            </Text>
          )}
        </View>
      )}
    </>
  );
};

export default MenuTab;
