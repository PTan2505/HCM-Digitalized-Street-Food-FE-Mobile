import SearchBar from '@components/SearchBar';
import { CatalogDishItem } from '@manager/menu/components/CatalogDishItem';
import {
  useAssignDishes,
  useManagerBranchDishList,
  useUnassignDishes,
  useVendorDishCatalog,
} from '@manager/menu/hooks/useManagerDishes';
import React, { useEffect, useMemo, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const CatalogTab = (): JSX.Element => {
  const { t } = useTranslation();
  const { items, isLoading, isLoadingMore, hasNext, loadMore } =
    useVendorDishCatalog();
  const {
    assignedIdSet,
    isLoading: isBranchLoading,
    isRefreshing: isBranchRefreshing,
  } = useManagerBranchDishList();
  const assignDishes = useAssignDishes();
  const unassignDishes = useUnassignDishes();
  const [search, setSearch] = useState('');
  const [pendingIds, setPendingIds] = useState<Set<number> | null>(null);
  const [pendingReset, setPendingReset] = useState(false);

  useEffect(() => {
    if (pendingReset && !isBranchRefreshing) {
      setPendingIds(null);
      setPendingReset(false);
    }
  }, [pendingReset, isBranchRefreshing]);

  const effectivePendingIds = useMemo(
    () => pendingIds ?? new Set(assignedIdSet),
    [pendingIds, assignedIdSet]
  );

  const isDirty = useMemo(() => {
    if (pendingIds === null) return false;
    if (pendingIds.size !== assignedIdSet.size) return true;
    for (const id of pendingIds) {
      if (!assignedIdSet.has(id)) return true;
    }
    return false;
  }, [pendingIds, assignedIdSet]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? items.filter((d) => d.name.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const handleToggle = (dishId: number): void => {
    setPendingIds((prev) => {
      const base = prev ?? new Set(assignedIdSet);
      const next = new Set(base);
      if (next.has(dishId)) next.delete(dishId);
      else next.add(dishId);
      return next;
    });
  };

  const handleSave = (): void => {
    if (!isDirty || pendingIds === null) return;
    const toAssign = [...pendingIds].filter((id) => !assignedIdSet.has(id));
    const toUnassign = [...assignedIdSet].filter((id) => !pendingIds.has(id));

    const finish = (): void => setPendingReset(true);
    const onError = (): void => Alert.alert(t('manager_menu.error_save'));

    if (toAssign.length > 0) {
      assignDishes.mutate(toAssign, {
        onSuccess: () => {
          if (toUnassign.length > 0) {
            unassignDishes.mutate(toUnassign, { onSuccess: finish, onError });
          } else {
            finish();
          }
        },
        onError,
      });
    } else if (toUnassign.length > 0) {
      unassignDishes.mutate(toUnassign, { onSuccess: finish, onError });
    }
  };

  if (isLoading || isBranchLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#006a2c" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl">📭</Text>
        <Text className="mt-3 text-base font-bold text-gray-700">
          {t('manager_menu.empty_catalog')}
        </Text>
      </View>
    );
  }

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
      <Text className="mx-4 mb-1 mt-1 text-xs text-gray-400">
        {t('manager_menu.select_hint')}
      </Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.dishId)}
        renderItem={({ item }) => (
          <CatalogDishItem
            item={item}
            isSelected={effectivePendingIds.has(item.dishId)}
            onToggle={handleToggle}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 96,
          gap: 12,
        }}
        onEndReached={hasNext ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              size="small"
              color="#006a2c"
              style={{ paddingVertical: 12 }}
            />
          ) : null
        }
      />
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 pb-4 pt-3">
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isDirty}
          className={`items-center justify-center rounded-xl py-3 ${isDirty ? 'bg-[#006a2c]' : 'bg-gray-300'}`}
        >
          <Text className="text-sm font-bold text-white">
            {isDirty ? t('manager_menu.save') : t('manager_menu.no_changes')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
