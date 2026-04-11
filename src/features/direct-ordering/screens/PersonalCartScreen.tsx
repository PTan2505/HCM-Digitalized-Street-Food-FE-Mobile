import type { TabBarItem } from '@components/TabBar';
import TabBar from '@components/TabBar';
import { QuantityControl } from '@components/QuantityControl';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { ActiveBranch, Dish } from '@features/home/types/branch';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
  addCartItemThunk,
  clearCartThunk,
  fetchCartThunk,
  removeCartItemThunk,
  selectCart,
  selectCartDisplayName,
  selectCartLoading,
  updateCartItemThunk,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLACEHOLDER_DISH =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200';

type PersonalCartScreenProps = StaticScreenProps<{
  branchName?: string;
  isOpen?: boolean;
}>;

export const PersonalCartScreen = ({
  route,
}: PersonalCartScreenProps): JSX.Element => {
  const { branchName = '', isOpen = true } = route.params ?? {};
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const cart = useAppSelector(selectCart);
  const cartDisplayName = useAppSelector(selectCartDisplayName);
  const cartLoading = useAppSelector(selectCartLoading);
  const [note, setNote] = useState('');
  const [menuDishes, setMenuDishes] = useState<Dish[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuBranch, setMenuBranch] = useState<ActiveBranch | null>(null);
  const [menuHasMore, setMenuHasMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [optimisticQty, setOptimisticQty] = useState<Record<number, number>>(
    {}
  );
  const prevCartRef = useRef(cart);
  const itemOrderRef = useRef<number[]>([]);

  useEffect(() => {
    if (cart !== prevCartRef.current) {
      prevCartRef.current = cart;
      setOptimisticQty({});
    }

    if (!cart) {
      itemOrderRef.current = [];
      return;
    }
    const tracked = new Set(itemOrderRef.current);
    cart.items.forEach((item) => {
      if (!tracked.has(item.dishId)) {
        itemOrderRef.current.push(item.dishId);
      }
    });
    itemOrderRef.current = itemOrderRef.current.filter((id) =>
      cart.items.some((item) => item.dishId === id)
    );
  }, [cart]);

  useEffect(() => {
    dispatch(fetchCartThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!cart?.branchId) return;
    const branchId = cart.branchId;
    setMenuLoading(true);

    Promise.all([
      axiosApi.branchApi.getDishesByBranch(branchId, { pageSize: 10 }),
      axiosApi.branchApi.getBranchById(branchId),
    ])
      .then(async ([dishRes, branchDetail]) => {
        setMenuDishes(dishRes.items);
        setMenuHasMore(dishRes.totalCount > 10);

        const vendor = await axiosApi.vendorApi.getVendorById(
          branchDetail.vendorId
        );
        const activeBranch: ActiveBranch = {
          branchId: branchDetail.branchId,
          vendorId: branchDetail.vendorId,
          vendorName: vendor.name,
          managerId: branchDetail.managerId,
          name: branchDetail.name,
          phoneNumber: branchDetail.phoneNumber,
          email: branchDetail.email,
          addressDetail: branchDetail.addressDetail,
          ward: branchDetail.ward,
          city: branchDetail.city,
          lat: branchDetail.lat,
          long: branchDetail.long,
          createdAt: branchDetail.createdAt,
          totalReviewCount: branchDetail.totalReviewCount,
          totalRatingSum: 0,
          dietaryPreferenceNames: [],
          updatedAt: branchDetail.updatedAt,
          isVerified: branchDetail.isVerified,
          avgRating: branchDetail.avgRating,
          isActive: branchDetail.isActive,
          isSubscribed: branchDetail.isSubscribed,
          tierId: branchDetail.tierId,
          tierName: branchDetail.tierName ?? '',
          finalScore: 0,
          distanceKm: null,
          dishes: dishRes.items,
        };
        setMenuBranch(activeBranch);
      })
      .catch(() => {
        setMenuDishes([]);
        setMenuHasMore(false);
      })
      .finally(() => setMenuLoading(false));
  }, [cart?.branchId]);

  const handleUpdateQuantity = useCallback(
    (dishId: number, currentQty: number, delta: number) => {
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        dispatch(removeCartItemThunk(dishId));
      } else {
        dispatch(updateCartItemThunk({ dishId, quantity: newQty }));
      }
    },
    [dispatch]
  );

  const handleClearCart = useCallback(() => {
    Alert.alert(t('cart.clear'), t('cart.clear_confirm'), [
      { text: t('auth.back'), style: 'cancel' },
      {
        text: t('dietary.confirm'),
        style: 'destructive',
        onPress: (): void => {
          dispatch(clearCartThunk()).then(() => {
            navigation.goBack();
          });
        },
      },
    ]);
  }, [dispatch, navigation, t]);

  const handlePlaceOrder = useCallback(() => {
    navigation.navigate('DirectCheckout', {
      branchName: cartDisplayName ?? branchName,
      note,
    });
  }, [navigation, cartDisplayName, branchName, note]);

  const getCartQuantity = useCallback(
    (dishId: number): number => {
      if (dishId in optimisticQty) return optimisticQty[dishId];
      return cart?.items.find((i) => i.dishId === dishId)?.quantity ?? 0;
    },
    [cart, optimisticQty]
  );

  const getServerQuantity = useCallback(
    (dishId: number): number =>
      cart?.items.find((i) => i.dishId === dishId)?.quantity ?? 0,
    [cart]
  );

  const handleMenuAdd = useCallback(
    (dish: Dish) => {
      const serverQty = getServerQuantity(dish.dishId);
      const displayQty = getCartQuantity(dish.dishId);
      const newQty = displayQty + 1;
      setOptimisticQty((prev) => ({ ...prev, [dish.dishId]: newQty }));

      if (serverQty === 0 && cart?.branchId) {
        dispatch(
          addCartItemThunk({
            branchId: cart.branchId,
            dishId: dish.dishId,
            quantity: newQty,
            displayName: cartDisplayName ?? branchName,
          })
        );
      } else {
        dispatch(
          updateCartItemThunk({ dishId: dish.dishId, quantity: newQty })
        );
      }
    },
    [
      dispatch,
      cart?.branchId,
      cartDisplayName,
      branchName,
      getCartQuantity,
      getServerQuantity,
    ]
  );

  const handleMenuDecrement = useCallback(
    (dish: Dish) => {
      const serverQty = getServerQuantity(dish.dishId);
      const displayQty = getCartQuantity(dish.dishId);
      const newQty = displayQty - 1;
      setOptimisticQty((prev) => ({ ...prev, [dish.dishId]: newQty }));

      if (serverQty <= 1) {
        dispatch(removeCartItemThunk(dish.dishId));
      } else {
        dispatch(
          updateCartItemThunk({ dishId: dish.dishId, quantity: newQty })
        );
      }
    },
    [dispatch, getCartQuantity, getServerQuantity]
  );

  const menuCategories = [
    'all',
    ...new Set(menuDishes.map((d) => d.categoryName)),
  ];
  const filteredMenuDishes =
    activeCategory === 'all'
      ? menuDishes
      : menuDishes.filter((d) => d.categoryName === activeCategory);

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {!isEmpty && (
          <TouchableOpacity
            className="ml-3 flex-1 flex-row items-center justify-start"
            onPress={() =>
              navigation.navigate('RestaurantDetails', {
                branch: menuBranch as ActiveBranch,
                displayName: cartDisplayName ?? branchName,
                tab: 'menu' as const,
              })
            }
          >
            <Text className="ml-3 text-lg font-bold text-black">
              {cartDisplayName ?? branchName}
              <Ionicons name="chevron-forward" size={16} color="#333" />
            </Text>
          </TouchableOpacity>
        )}
        {!isEmpty && (
          <TouchableOpacity onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {cartLoading && !cart ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isEmpty ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text className="mt-4 text-lg font-semibold text-gray-400">
            {t('cart.empty')}
          </Text>
          <Text className="mt-1 text-base text-gray-300">
            {t('cart.empty_hint')}
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Cart Items */}
            {[...cart.items]
              .sort(
                (a, b) =>
                  itemOrderRef.current.indexOf(a.dishId) -
                  itemOrderRef.current.indexOf(b.dishId)
              )
              .map((item) => (
                <View
                  key={item.dishId}
                  className="flex-row items-center border-b border-gray-50 px-4 py-3"
                >
                  <Image
                    source={{ uri: item.dishImageUrl ?? PLACEHOLDER_DISH }}
                    className="mr-3 h-14 w-14 rounded-lg bg-gray-100"
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-black">
                      {item.dishName}
                    </Text>
                    <Text className="mt-0.5 text-base text-gray-400">
                      {`${item.unitPrice.toLocaleString('vi-VN')}đ`}
                    </Text>
                  </View>

                  <QuantityControl
                    variant="cart"
                    quantity={item.quantity}
                    onDecrement={() =>
                      handleUpdateQuantity(item.dishId, item.quantity, -1)
                    }
                    onIncrement={() =>
                      handleUpdateQuantity(item.dishId, item.quantity, 1)
                    }
                    disabled={cartLoading}
                  />
                </View>
              ))}

            {/* Note */}
            <View className="px-4 py-4">
              <Text className="mb-2 text-base font-semibold text-gray-500">
                {t('cart.note_label')}
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('cart.note_placeholder')}
                placeholderTextColor="#bbb"
                multiline
                maxLength={200}
                className="min-h-[60px] rounded-xl border border-gray-200 px-4 py-3 text-base text-black"
              />
            </View>

            {/* Menu */}
            {menuLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : menuDishes.length > 0 ? (
              <View className="border-t border-gray-100">
                <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
                  <Text className="text-xl font-bold text-black">
                    {t('cart.add_more')}
                  </Text>
                  {menuHasMore && menuBranch && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('RestaurantDetails', {
                          branch: menuBranch,
                          displayName: cartDisplayName ?? branchName,
                          tab: 'menu' as const,
                        })
                      }
                    >
                      <Text className="text-base font-semibold text-primary">
                        {t('cart.view_all_menu')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Category Tabs */}
                <TabBar
                  tabs={menuCategories
                    .filter((cat): cat is string => cat != null)
                    .map(
                      (cat): TabBarItem<string> => ({
                        key: cat,
                        label: cat === 'all' ? t('actions.all') : cat,
                      })
                    )}
                  activeTab={activeCategory}
                  onTabChange={setActiveCategory}
                  activeColor="#FF6B35"
                  indicatorColor="#FF6B35"
                />

                {/* Dish Items */}
                {activeCategory === 'all' ? (
                  <>
                    {menuCategories.map((cat) => {
                      const group = menuDishes.filter(
                        (d) => (d.categoryName ?? t('actions.other')) === cat
                      );
                      if (group.length === 0) return null;
                      return (
                        <View
                          key={cat}
                          className="border-b border-gray-200 p-4"
                        >
                          <Text className="mb-4 text-lg font-bold capitalize text-black">
                            {cat}
                          </Text>
                          {group.map((dish) => {
                            const qty = getCartQuantity(dish.dishId);
                            return (
                              <View key={dish.dishId} className="mb-4 flex-row">
                                <Image
                                  source={{
                                    uri: dish.imageUrl ?? PLACEHOLDER_DISH,
                                  }}
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
                                      {`${dish.price.toLocaleString('vi-VN')}đ`}
                                    </Text>
                                    {dish.isSoldOut ? (
                                      <Text className="text-sm text-red-400">
                                        {t('actions.sold_out')}
                                      </Text>
                                    ) : !isOpen ? null : qty === 0 ? (
                                      <TouchableOpacity
                                        onPress={() => handleMenuAdd(dish)}
                                        className="rounded-full bg-primary px-4 py-1.5"
                                      >
                                        <Text className="text-base font-semibold text-white">
                                          {t('cart.add')}
                                        </Text>
                                      </TouchableOpacity>
                                    ) : (
                                      <QuantityControl
                                        quantity={qty}
                                        onDecrement={() =>
                                          handleMenuDecrement(dish)
                                        }
                                        onIncrement={() => handleMenuAdd(dish)}
                                      />
                                    )}
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      );
                    })}
                  </>
                ) : (
                  <View className="border-b border-gray-200 p-4">
                    {filteredMenuDishes.length > 0 ? (
                      filteredMenuDishes.map((dish) => {
                        const qty = getCartQuantity(dish.dishId);
                        return (
                          <View key={dish.dishId} className="mb-4 flex-row">
                            <Image
                              source={{
                                uri: dish.imageUrl ?? PLACEHOLDER_DISH,
                              }}
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
                                  {`${dish.price.toLocaleString('vi-VN')}đ`}
                                </Text>
                                {dish.isSoldOut ? (
                                  <Text className="text-sm text-red-400">
                                    {t('actions.sold_out')}
                                  </Text>
                                ) : !isOpen ? null : qty === 0 ? (
                                  <TouchableOpacity
                                    onPress={() => handleMenuAdd(dish)}
                                    className="rounded-full bg-primary px-4 py-1.5"
                                  >
                                    <Text className="text-base font-semibold text-white">
                                      {t('cart.add')}
                                    </Text>
                                  </TouchableOpacity>
                                ) : (
                                  <QuantityControl
                                    quantity={qty}
                                    onDecrement={() => handleMenuDecrement(dish)}
                                    onIncrement={() => handleMenuAdd(dish)}
                                  />
                                )}
                              </View>
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <Text className="py-8 text-center text-base text-gray-400">
                        {t('actions.no_items')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>

          {/* Footer */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 pb-8 pt-3">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-gray-500">
                {t('cart.total')}
              </Text>
              <Text className="text-xl font-bold text-[#00B14F]">
                {`${cart.totalAmount.toLocaleString('vi-VN')}₫`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={!isOpen || cartLoading}
              className={`items-center rounded-2xl py-4 ${isOpen ? 'bg-primary' : 'bg-gray-300'}`}
            >
              {cartLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {isOpen ? t('cart.place_order') : t('cart.stall_closed')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};
