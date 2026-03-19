import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
  clearCartThunk,
  fetchCartThunk,
  removeCartItemThunk,
  selectCart,
  selectCartDisplayName,
  selectCartLoading,
  updateCartItemThunk,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
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
  branchName: string;
  isOpen: boolean;
}>;

export const PersonalCartScreen = ({
  route,
}: PersonalCartScreenProps): JSX.Element => {
  const { branchName, isOpen } = route.params;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const cart = useAppSelector(selectCart);
  const cartDisplayName = useAppSelector(selectCartDisplayName);
  const cartLoading = useAppSelector(selectCartLoading);
  const [note, setNote] = useState('');

  useEffect(() => {
    dispatch(fetchCartThunk());
  }, [dispatch]);

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

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-lg font-bold text-black">
          {cartDisplayName ?? branchName}
        </Text>
        {!isEmpty && (
          <TouchableOpacity onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text className="mt-4 text-lg font-semibold text-gray-400">
            {t('cart.empty')}
          </Text>
          <Text className="mt-1 text-sm text-gray-300">
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
            {cart.items.map((item) => (
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
                  <Text className="mt-0.5 text-sm text-gray-400">
                    {`${item.unitPrice.toLocaleString('vi-VN')}đ`}
                  </Text>
                </View>

                <View className="flex-row items-center rounded-full bg-gray-100">
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdateQuantity(item.dishId, item.quantity, -1)
                    }
                    disabled={cartLoading}
                    className="h-8 w-8 items-center justify-center rounded-full bg-[#a1d973]"
                  >
                    <Text className="text-lg font-bold text-white">−</Text>
                  </TouchableOpacity>
                  <Text className="min-w-[28px] text-center text-sm font-semibold text-black">
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdateQuantity(item.dishId, item.quantity, 1)
                    }
                    disabled={cartLoading}
                    className="h-8 w-8 items-center justify-center rounded-full bg-[#a1d973]"
                  >
                    <Text className="text-lg font-bold text-white">+</Text>
                  </TouchableOpacity>
                </View>

                <Text className="ml-3 min-w-[50px] text-right text-base font-semibold text-black">
                  {`${Math.round(item.lineTotal / 1000)}k`}
                </Text>
              </View>
            ))}

            {/* Note */}
            <View className="px-4 py-4">
              <Text className="mb-2 text-sm font-semibold text-gray-500">
                {t('cart.note_label')}
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('cart.note_placeholder')}
                placeholderTextColor="#bbb"
                multiline
                maxLength={200}
                className="min-h-[60px] rounded-xl border border-gray-200 px-4 py-3 text-sm text-black"
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 pb-8 pt-3">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-gray-500">
                {t('cart.total')}
              </Text>
              <Text className="text-xl font-bold text-[#00B14F]">
                {`${cart.totalAmount.toLocaleString('vi-VN')}₫`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={!isOpen || cartLoading}
              className={`items-center rounded-2xl py-4 ${isOpen ? 'bg-[#a1d973]' : 'bg-gray-300'}`}
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
