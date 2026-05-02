import fallbackDishImage from '@assets/logos/lowcaLogo.png';
import { COLORS } from '@constants/colors';
import type { VendorDish } from '@manager/menu/api/managerDishApi';
import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Switch, Text, View } from 'react-native';

interface BranchDishCardProps {
  item: VendorDish;
  onToggle: (dishId: number, isSoldOut: boolean) => void;
}

const formatPrice = (price: number): string =>
  price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export const BranchDishCard = ({
  item,
  onToggle,
}: BranchDishCardProps): JSX.Element => {
  const { t } = useTranslation();
  const soldOut = item.isSoldOut;

  return (
    <View
      className={`flex-row gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm ${soldOut ? 'opacity-75' : ''}`}
    >
      <View className="relative h-24 w-24 overflow-hidden rounded-lg">
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : fallbackDishImage}
          className="h-24 w-24 rounded-lg"
          resizeMode="cover"
        />
        {soldOut && (
          <View className="absolute inset-0 items-center justify-center bg-white/55">
            <View className="rounded-full bg-[#b02500] px-1.5 py-0.5">
              <Text className="text-[9px] font-extrabold uppercase tracking-wider text-[#ffefec]">
                {t('manager_menu.out')}
              </Text>
            </View>
          </View>
        )}
      </View>

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
          <Text
            className={`text-base font-bold ${soldOut ? 'text-gray-400' : 'text-primary'}`}
          >
            {formatPrice(item.price)}
          </Text>
          <Switch
            value={!soldOut}
            onValueChange={(val) => onToggle(item.dishId, !val)}
            trackColor={{ false: '#a7ecc1', true: COLORS.primaryLight }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </View>
  );
};
