import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useVendorDishes } from '@manager/dish/hooks/useVendorDishes';
import type { VendorDish } from '@manager/menu/api/managerDishApi';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatVnd = (n: number): string =>
  `${n.toLocaleString('vi-VN')} đ`;

const DishCard = ({ dish }: { dish: VendorDish }): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="mb-3 flex-row rounded-2xl bg-white p-3 shadow-sm">
      <View className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="image-outline" size={28} color="#9ca3af" />
          </View>
        )}
      </View>
      <View className="ml-3 flex-1">
        <View className="flex-row items-start justify-between">
          <Text
            className="flex-1 pr-2 text-base font-bold text-gray-900"
            numberOfLines={2}
          >
            {dish.name}
          </Text>
          {!dish.isActive ? (
            <View className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              <Text className="text-xs font-bold text-slate-600">
                {t('vendor_dish.inactive')}
              </Text>
            </View>
          ) : dish.isSoldOut ? (
            <View className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5">
              <Text className="text-xs font-bold text-amber-700">
                {t('vendor_dish.sold_out')}
              </Text>
            </View>
          ) : (
            <View className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5">
              <Text className="text-xs font-bold text-green-700">
                {t('vendor_dish.available')}
              </Text>
            </View>
          )}
        </View>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {dish.categoryName ?? t('vendor_dish.no_category')}
        </Text>
        <Text className="mt-1 text-sm font-bold text-primary">
          {formatVnd(dish.price)}
        </Text>
        {dish.tasteNames.length > 0 && (
          <View className="mt-2 flex-row flex-wrap gap-1">
            {dish.tasteNames.slice(0, 3).map((taste) => (
              <View
                key={taste}
                className="rounded-full bg-gray-100 px-2 py-0.5"
              >
                <Text className="text-xs text-gray-600">{taste}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export const VendorDishCatalogScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { data: vendorInfo } = useVendorInfo();
  const vendorId = vendorInfo?.vendorId;
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => clearTimeout(handle);
  }, [keyword]);

  const {
    dishes,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNext,
    loadMore,
    refresh,
  } = useVendorDishes(vendorId, debouncedKeyword);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('vendor_dish.title')}
        onBackPress={() => navigation.goBack()}
      />

      <View className="border-b border-gray-100 bg-white px-4 py-3">
        <View className="flex-row items-center rounded-full bg-gray-100 px-3 py-2">
          <Ionicons name="search-outline" size={16} color="#6b7280" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder={t('vendor_dish.search_placeholder')}
            placeholderTextColor="#9ca3af"
            className="ml-2 flex-1 text-sm text-gray-800"
          />
          {keyword.length > 0 ? (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading && dishes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : dishes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-gray-500">
            {t('vendor_dish.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => String(item.dishId)}
          renderItem={({ item }) => <DishCard dish={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refresh}
          refreshing={isRefreshing}
          onEndReached={() => {
            if (hasNext && !isLoadingMore) loadMore();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-4">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};
