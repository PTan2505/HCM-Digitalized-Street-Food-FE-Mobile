import fallbackDishImage from '@assets/logos/lowcaLogo.png';
import type { VendorDish } from '@manager/menu/api/managerDishApi';
import React, { type JSX } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CatalogDishItemProps {
  item: VendorDish;
  isSelected: boolean;
  onToggle: (dishId: number) => void;
}

const formatPrice = (price: number): string =>
  price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export const CatalogDishItem = ({
  item,
  isSelected,
  onToggle,
}: CatalogDishItemProps): JSX.Element => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(item.dishId)}
      className={`flex-row gap-3 rounded-xl border bg-white p-3 shadow-sm ${
        isSelected ? 'border-primary' : 'border-gray-100'
      }`}
    >
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : fallbackDishImage}
        className="h-24 w-24 rounded-lg"
        resizeMode="cover"
      />

      <View className="flex-1 justify-between">
        <Text
          className="text-sm font-semibold leading-5 text-[#043620]"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        {item.categoryName ? (
          <Text className="text-xs text-[#38644b]">{item.categoryName}</Text>
        ) : null}
        <View className="mt-1.5 flex-row items-center justify-between">
          <Text className="text-base font-bold text-primary">
            {formatPrice(item.price)}
          </Text>
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
              isSelected
                ? 'border-primary bg-primary'
                : 'border-gray-300 bg-transparent'
            }`}
          >
            {isSelected && (
              <Text className="text-xs font-bold text-white">✓</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
