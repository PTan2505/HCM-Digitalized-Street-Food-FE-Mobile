import { Ionicons } from '@expo/vector-icons';
import type { Dish } from '@features/home/types/branch';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  addCartItemThunk,
  clearCartThunk,
  removeCartItemThunk,
  selectCart,
  updateCartItemThunk,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
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
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    'all'
  );

  // Optimistic quantity overrides — updated instantly on press, cleared when cart syncs
  const [optimisticQty, setOptimisticQty] = useState<Record<number, number>>(
    {}
  );
  const prevCartRef = useRef(cart);

  useEffect(() => {
    if (cart !== prevCartRef.current) {
      prevCartRef.current = cart;
      setOptimisticQty({});
    }
  }, [cart]);

  const categories = ['all', ...new Set(dishes.map((d) => d.categoryName))];

  const filteredDishes =
    activeCategory === 'all'
      ? dishes
      : dishes.filter((d) => d.categoryName === activeCategory);

  const getCartQuantity = useCallback(
    (dishId: number): number => {
      if (dishId in optimisticQty) return optimisticQty[dishId];
      if (cart?.branchId !== branchId) return 0;
      return cart.items.find((i) => i.dishId === dishId)?.quantity ?? 0;
    },
    [cart, branchId, optimisticQty]
  );

  const getServerQuantity = useCallback(
    (dishId: number): number => {
      if (cart?.branchId !== branchId) return 0;
      return cart.items.find((i) => i.dishId === dishId)?.quantity ?? 0;
    },
    [cart, branchId]
  );

  const addOrIncrement = useCallback(
    (dish: Dish) => {
      const serverQty = getServerQuantity(dish.dishId);
      const displayQty = getCartQuantity(dish.dishId);
      const newQty = displayQty + 1;
      setOptimisticQty((prev) => ({ ...prev, [dish.dishId]: newQty }));

      if (serverQty === 0) {
        dispatch(
          addCartItemThunk({
            branchId,
            dishId: dish.dishId,
            quantity: newQty,
          })
        );
      } else {
        dispatch(
          updateCartItemThunk({
            dishId: dish.dishId,
            quantity: newQty,
          })
        );
      }
    },
    [dispatch, branchId, getCartQuantity, getServerQuantity]
  );

  const handleAdd = useCallback(
    (dish: Dish) => {
      if (cart && cart.items.length > 0 && cart.branchId !== branchId) {
        Alert.alert(t('cart.replace_title'), t('cart.replace_message'), [
          { text: t('cart.cancel'), style: 'cancel' },
          {
            text: t('cart.replace_confirm'),
            style: 'destructive',
            onPress: async (): Promise<void> => {
              await dispatch(clearCartThunk()).unwrap();
              addOrIncrement(dish);
            },
          },
        ]);
        return;
      }
      addOrIncrement(dish);
    },
    [cart, branchId, t, dispatch, addOrIncrement]
  );

  const handleDecrement = useCallback(
    (dish: Dish) => {
      const serverQty = getServerQuantity(dish.dishId);
      const displayQty = getCartQuantity(dish.dishId);
      const newQty = displayQty - 1;
      setOptimisticQty((prev) => ({ ...prev, [dish.dishId]: newQty }));

      if (serverQty <= 1) {
        dispatch(removeCartItemThunk(dish.dishId));
      } else {
        dispatch(
          updateCartItemThunk({
            dishId: dish.dishId,
            quantity: newQty,
          })
        );
      }
    },
    [dispatch, getCartQuantity, getServerQuantity]
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
            className="text-[13px] leading-[18px] text-gray-400"
            numberOfLines={2}
          >
            {dish.description}
          </Text>
          {dish.tasteNames.length > 0 && (
            <View className="my-1 flex-row flex-wrap gap-1">
              {dish.tasteNames.map((taste) => (
                <View
                  key={taste}
                  className="rounded-full bg-orange-50 px-2 py-0.5"
                >
                  <Text className="text-[10px] font-medium text-orange-400">
                    {taste}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-[#00B14F]">
              {`${dish.price.toLocaleString()}đ`}
            </Text>
            {dish.isSoldOut ? (
              <Text className="text-xs text-red-400">
                {t('actions.sold_out')}
              </Text>
            ) : disabled ? null : qty === 0 ? (
              <TouchableOpacity
                onPress={() => handleAdd(dish)}
                className="rounded-full bg-[#a1d973] px-4 py-1.5"
              >
                <Text className="text-sm font-semibold text-white">
                  {t('cart.add')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center rounded-full bg-gray-100">
                <TouchableOpacity
                  onPress={() => handleDecrement(dish)}
                  className="h-10 w-10 items-center justify-center rounded-full"
                >
                  <Ionicons name="remove-circle" size={32} color="#a1d973" />
                </TouchableOpacity>
                <Text className="min-w-[28px] text-center text-sm font-semibold text-black">
                  {qty}
                </Text>
                <TouchableOpacity
                  onPress={() => handleAdd(dish)}
                  className="h-10 w-10 items-center justify-center rounded-full"
                >
                  <Ionicons name="add-circle" size={32} color="#a1d973" />
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
      {/* Closed notice */}
      {!isOpen && (
        <View className="mx-4 mt-4 flex-row items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
          <Ionicons name="information-circle" size={20} color="#f59e0b" />
          <Text className="flex-1 text-xs leading-4 text-amber-700">
            {t('cart.stall_closed_notice')}
          </Text>
        </View>
      )}

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
