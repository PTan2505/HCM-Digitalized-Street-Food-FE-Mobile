import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  fetchMyCartsThunk,
  selectCarts,
  selectCartsDisplayNames,
  selectCartsLoading,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const MyCartsScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const carts = useAppSelector(selectCarts);
  const cartsDisplayNames = useAppSelector(selectCartsDisplayNames);
  const cartsLoading = useAppSelector(selectCartsLoading);

  useFocusEffect(
    useCallback(() => {
      void dispatch(fetchMyCartsThunk());
    }, [dispatch])
  );

  const cartsWithItems = carts.filter((c) => c.items.length > 0);

  const handleCartPress = useCallback(
    (branchId: number) => {
      navigation.navigate('Restaurant', { branchId, tab: 'menu' });
    },
    [navigation]
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('cart.my_carts')}
        onBackPress={() => navigation.goBack()}
      />

      {cartsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : cartsWithItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text className="mt-4 text-lg font-semibold text-gray-400">
            {t('cart.my_carts_empty')}
          </Text>
          <Text className="mt-1 text-center text-base text-gray-300">
            {t('cart.my_carts_empty_hint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={cartsWithItems}
          keyExtractor={(item) => String(item.cartId)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => {
            const itemCount = item.items.reduce(
              (sum, i) => sum + i.quantity,
              0
            );
            const totalFormatted = `${item.totalAmount.toLocaleString('vi-VN')}đ`;

            return (
              <TouchableOpacity
                onPress={() =>
                  item.branchId != null && handleCartPress(item.branchId)
                }
                className="mx-4 mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Info */}
                <View className="flex-1">
                  <Text
                    className="text-base font-bold text-black"
                    numberOfLines={1}
                  >
                    {(item.branchId != null
                      ? (cartsDisplayNames[item.branchId] ?? item.branchName)
                      : item.branchName) ?? '—'}
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500">
                    {t('cart.n_items_total', {
                      count: itemCount,
                      total: totalFormatted,
                    })}
                  </Text>
                </View>

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#bbb" />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};
