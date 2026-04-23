import SearchBar from '@components/SearchBar';
import { BranchDishCard } from '@manager/menu/components/BranchDishCard';
import { CategoryChips } from '@manager/menu/components/CategoryChips';
import {
  useManagerBranchDishList,
  useUpdateDishAvailability,
} from '@manager/menu/hooks/useManagerDishes';
import React, { useEffect, useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export const BranchMenuTab = (): JSX.Element => {
  const { t } = useTranslation();
  const { dishes, isLoading, isRefreshing, refresh } =
    useManagerBranchDishList();
  const updateAvailability = useUpdateDishAvailability();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  useEffect(() => {
    if (!isRefreshing) setIsManualRefreshing(false);
  }, [isRefreshing]);

  const handleRefresh = (): void => {
    setIsManualRefreshing(true);
    refresh();
  };

  const categories = useMemo(
    () => [
      ...new Set(
        dishes.map((d) => d.categoryName).filter((c): c is string => !!c)
      ),
    ],
    [dishes]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return dishes.filter((d) => {
      const matchSearch = !q || d.name.toLowerCase().includes(q);
      const matchCat = !selectedCategory || d.categoryName === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [dishes, search, selectedCategory]);

  const handleToggle = (dishId: number, isSoldOut: boolean): void => {
    updateAvailability.mutate({ dishId, isSoldOut });
  };

  return (
    <View className="flex-1">
      <View className="px-4 pb-1 pt-3">
        <SearchBar
          placeholder={t('manager_menu.search_placeholder')}
          value={search}
          onChangeText={setSearch}
          noMargin
        />
      </View>

      {categories.length > 0 && (
        <CategoryChips
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#006a2c" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl">🍽️</Text>
          <Text className="mt-3 text-base font-bold text-gray-700">
            {dishes.length === 0
              ? t('manager_menu.empty_branch')
              : t('manager_menu.no_results')}
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            {dishes.length === 0
              ? t('manager_menu.empty_branch_subtitle')
              : t('manager_menu.no_results_subtitle')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.dishId)}
          renderItem={({ item }) => (
            <BranchDishCard item={item} onToggle={handleToggle} />
          )}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            gap: 12,
          }}
          refreshing={isManualRefreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};
