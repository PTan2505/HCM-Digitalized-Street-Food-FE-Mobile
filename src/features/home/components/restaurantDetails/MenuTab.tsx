import { QuantityControl } from '@components/QuantityControl';
import TabBar from '@components/TabBar';
import { Ionicons } from '@expo/vector-icons';
import { useBranchDishes } from '@features/home/hooks/useBranchDishes';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400';

interface MenuTabProps {
  branchId: number;
  isOpen: boolean;
  isSubscribed: boolean;
  displayName: string;
}

const MenuTab = ({
  branchId,
  isOpen,
  isSubscribed,
  displayName,
}: MenuTabProps): JSX.Element => {
  const { dishes } = useBranchDishes(branchId);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const hasCart = (cart?.items.length ?? 0) > 0;
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  const categories = useMemo(
    () => [
      'all',
      ...new Set(dishes.map((d) => d.categoryName ?? t('actions.other'))),
    ],
    [dishes, t]
  );

  const categoryTabs = useMemo(
    () =>
      categories.map((cat) => ({
        key: cat,
        label: cat === 'all' ? t('actions.all') : cat,
      })),
    [categories, t]
  );

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
            displayName,
          })
        );
      } else {
        dispatch(
          updateCartItemThunk({
            dishId: dish.dishId,
            quantity: newQty,
            branchId,
          })
        );
      }
    },
    [dispatch, branchId, displayName, getCartQuantity, getServerQuantity]
  );

  const handleAdd = useCallback(
    (dish: Dish) => {
      if (!isSubscribed) {
        Alert.alert(t('auth.error'), t('cart.not_subscribed_notice'));
        return;
      }
      if (cart && cart.items.length > 0 && cart.branchId !== branchId) {
        Alert.alert(t('cart.replace_title'), t('cart.replace_message'), [
          { text: t('cart.cancel'), style: 'cancel' },
          {
            text: t('cart.replace_confirm'),
            style: 'destructive',
            onPress: async (): Promise<void> => {
              await dispatch(
                clearCartThunk(cart.branchId ?? branchId)
              ).unwrap();
              addOrIncrement(dish);
            },
          },
        ]);
        return;
      }
      addOrIncrement(dish);
    },
    [cart, branchId, t, dispatch, addOrIncrement, isSubscribed]
  );

  const handleDecrement = useCallback(
    (dish: Dish) => {
      const serverQty = getServerQuantity(dish.dishId);
      const displayQty = getCartQuantity(dish.dishId);
      const newQty = displayQty - 1;
      setOptimisticQty((prev) => ({ ...prev, [dish.dishId]: newQty }));

      if (serverQty <= 1) {
        dispatch(removeCartItemThunk({ dishId: dish.dishId, branchId }));
      } else {
        dispatch(
          updateCartItemThunk({
            dishId: dish.dishId,
            quantity: newQty,
            branchId,
          })
        );
      }
    },
    [dispatch, branchId, getCartQuantity, getServerQuantity]
  );

  const renderDish = (dish: Dish): JSX.Element => {
    const qty = getCartQuantity(dish.dishId);
    const disabled = dish.isSoldOut || !isOpen || !isSubscribed;

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
          {(dish.tasteNames?.length ?? 0) > 0 && (
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
              {`${dish.price.toLocaleString('vi-VN')}đ`}
            </Text>
            {dish.isSoldOut ? (
              <Text className="text-sm text-red-400">
                {t('actions.sold_out')}
              </Text>
            ) : disabled ? null : qty === 0 ? (
              <TouchableOpacity
                onPress={() => handleAdd(dish)}
                className="rounded-full bg-primary px-4 py-1.5"
              >
                <Text className="text-base font-semibold text-white">
                  {t('cart.add')}
                </Text>
              </TouchableOpacity>
            ) : (
              <QuantityControl
                quantity={qty}
                onDecrement={() => handleDecrement(dish)}
                onIncrement={() => handleAdd(dish)}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${hasCart ? 'mb-32' : ''}`}>
      {/* Not subscribed notice */}
      {!isSubscribed && (
        <View className="mx-4 mt-4 flex-row items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
          <Ionicons name="ban-outline" size={20} color="#ef4444" />
          <Text className="flex-1 text-sm leading-4 text-red-600">
            {t('cart.not_subscribed_notice')}
          </Text>
        </View>
      )}

      {/* Closed notice */}
      {isSubscribed && !isOpen && (
        <View className="mx-4 mt-4 flex-row items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
          <Ionicons name="information-circle" size={20} color="#f59e0b" />
          <Text className="flex-1 text-sm leading-4 text-amber-700">
            {t('cart.stall_closed_notice')}
          </Text>
        </View>
      )}

      {/* Category Tabs */}
      <View className="pt-4">
        <TabBar<string>
          tabs={categoryTabs}
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
          activeColor="#FF6B35"
          inactiveColor="#999999"
          indicatorColor="#FF6B35"
        />
      </View>

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
    </View>
  );
};

export default MenuTab;
