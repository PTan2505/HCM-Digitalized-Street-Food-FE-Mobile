import type { Dish } from '@features/home/types/branch';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addCartItemThunk,
  removeCartItemThunk,
  selectCart,
  selectCartLoading,
  updateCartItemThunk,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400';

interface MenuTabProps {
  dishes: Dish[];
  branchId: number;
  isOpen: boolean;
}

const MenuTab = ({ dishes, branchId, isOpen }: MenuTabProps): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const cartLoading = useAppSelector(selectCartLoading);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    'all'
  );

  const categories = ['all', ...new Set(dishes.map((d) => d.categoryName))];

  const filteredDishes =
    activeCategory === 'all'
      ? dishes
      : dishes.filter((d) => d.categoryName === activeCategory);

  const getCartQuantity = useCallback(
    (dishId: number): number => {
      return cart?.items.find((i) => i.dishId === dishId)?.quantity ?? 0;
    },
    [cart]
  );

  const handleAdd = useCallback(
    (dish: Dish) => {
      const currentQty = getCartQuantity(dish.dishId);
      if (currentQty === 0) {
        dispatch(
          addCartItemThunk({
            branchId,
            dishId: dish.dishId,
            quantity: 1,
          })
        );
      } else {
        dispatch(
          updateCartItemThunk({
            dishId: dish.dishId,
            quantity: currentQty + 1,
          })
        );
      }
    },
    [dispatch, branchId, getCartQuantity]
  );

  const handleDecrement = useCallback(
    (dish: Dish) => {
      const currentQty = getCartQuantity(dish.dishId);
      if (currentQty <= 1) {
        dispatch(removeCartItemThunk(dish.dishId));
      } else {
        dispatch(
          updateCartItemThunk({
            dishId: dish.dishId,
            quantity: currentQty - 1,
          })
        );
      }
    },
    [dispatch, getCartQuantity]
  );

  const renderDish = (dish: Dish): JSX.Element => {
    const qty = getCartQuantity(dish.dishId);
    const disabled = dish.isSoldOut || !isOpen;

    return (
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
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-[#00B14F]">
              {`${Math.round(dish.price / 1000)}k`}
            </Text>
            {disabled ? (
              <Text className="text-xs text-red-400">
                {dish.isSoldOut
                  ? t('actions.sold_out')
                  : t('cart.stall_closed')}
              </Text>
            ) : qty === 0 ? (
              <TouchableOpacity
                onPress={() => handleAdd(dish)}
                disabled={cartLoading}
                className="rounded-full bg-[#a1d973] px-4 py-1.5"
              >
                {cartLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    {t('cart.add')}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center rounded-full bg-gray-100">
                <TouchableOpacity
                  onPress={() => handleDecrement(dish)}
                  disabled={cartLoading}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#a1d973]"
                >
                  <Text className="text-lg font-bold text-white">−</Text>
                </TouchableOpacity>
                <Text className="min-w-[28px] text-center text-sm font-semibold text-black">
                  {qty}
                </Text>
                <TouchableOpacity
                  onPress={() => handleAdd(dish)}
                  disabled={cartLoading}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#a1d973]"
                >
                  <Text className="text-lg font-bold text-white">+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

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
