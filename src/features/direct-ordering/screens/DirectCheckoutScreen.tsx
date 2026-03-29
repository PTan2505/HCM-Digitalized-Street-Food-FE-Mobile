import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
  checkoutThunk,
  clearOrderError,
  selectCart,
  selectOrderError,
  selectOrderLoading,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAYMENT_METHODS: {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [{ key: 'bank_transfer', icon: 'business-outline' }];

type DirectCheckoutScreenProps = StaticScreenProps<{
  branchName: string;
  note?: string;
}>;

export const DirectCheckoutScreen = ({
  route,
}: DirectCheckoutScreenProps): JSX.Element => {
  const { branchName, note } = route.params;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const cart = useAppSelector(selectCart);
  const orderLoading = useAppSelector(selectOrderLoading);
  const orderError = useAppSelector(selectOrderError);
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [isTakeAway, setIsTakeAway] = useState(true);

  useEffect(() => {
    return (): void => {
      dispatch(clearOrderError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (orderError) {
      Alert.alert(t('auth.error'), orderError);
    }
  }, [orderError, t]);

  const getPaymentLabel = (key: string): string => {
    const labels: Record<string, string> = {
      wallet: t('checkout.wallet'),
      bank_transfer: t('checkout.bank_transfer'),
      viet_qr: t('checkout.viet_qr'),
    };
    return labels[key] ?? key;
  };

  const handleConfirm = useCallback(async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert(t('auth.error'), t('checkout.empty_cart'));
      return;
    }

    try {
      const result = await dispatch(
        checkoutThunk({
          paymentMethod: selectedMethod,
          isTakeAway,
          table: note ?? undefined,
        })
      ).unwrap();

      navigation.navigate('PaymentQR', {
        orderId: result.order.orderId,
        qrCode: result.payment.qrCode ?? '',
        totalAmount: result.order.finalAmount,
        branchName,
      });
    } catch {
      // Error is handled by the slice / useEffect above
    }
  }, [
    dispatch,
    selectedMethod,
    isTakeAway,
    note,
    cart,
    navigation,
    branchName,
    t,
  ]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-black">
          {t('checkout.title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Order Summary */}
        <View className="border-b border-gray-100 px-4 py-4">
          <Text className="mb-3 text-base font-bold text-black">
            {t('checkout.order_summary')}
          </Text>
          <Text className="mb-2 text-sm text-gray-500">{branchName}</Text>
          {cart?.items.map((item) => (
            <View
              key={item.dishId}
              className="mb-1 flex-row items-center justify-between"
            >
              <Text className="text-sm text-black">
                {item.dishName} × {item.quantity}
              </Text>
              <Text className="text-sm font-semibold text-black">
                {`${item.lineTotal.toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
          ))}
          {note ? (
            <Text className="mt-2 text-xs italic text-gray-400">
              {t('cart.note_label')}: {note}
            </Text>
          ) : null}
          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Text className="text-base font-bold text-black">
              {t('cart.total')}
            </Text>
            <Text className="text-lg font-bold text-[#00B14F]">
              {cart ? `${cart.totalAmount.toLocaleString('vi-VN')}₫` : '—'}
            </Text>
          </View>
        </View>

        {/* Take Away Toggle */}
        <TouchableOpacity
          onPress={() => setIsTakeAway(!isTakeAway)}
          className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4"
        >
          <Text className="text-sm font-semibold text-black">Mang đi</Text>
          <View
            className={`h-5 w-5 items-end justify-end rounded border-2 ${isTakeAway ? 'border-[#a1d973] bg-[#a1d973]' : 'border-gray-300 bg-white'}`}
          >
            {isTakeAway && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
        </TouchableOpacity>

        {/* Payment Method */}
        <View className="px-4 py-4">
          <Text className="mb-3 text-base font-bold text-black">
            {t('checkout.payment_method')}
          </Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.key}
              onPress={() => setSelectedMethod(method.key)}
              className={`mb-2 flex-row items-center rounded-xl border px-4 py-3.5 ${
                selectedMethod === method.key
                  ? 'border-[#a1d973] bg-[#f4fce3]'
                  : 'border-gray-200'
              }`}
            >
              <Ionicons
                name={method.icon}
                size={22}
                color={selectedMethod === method.key ? '#7AB82D' : '#999'}
              />
              <Text
                className={`ml-3 flex-1 text-sm font-semibold ${
                  selectedMethod === method.key
                    ? 'text-[#7AB82D]'
                    : 'text-black'
                }`}
              >
                {getPaymentLabel(method.key)}
              </Text>
              {selectedMethod === method.key && (
                <Ionicons name="checkmark-circle" size={20} color="#7AB82D" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 pb-8 pt-3">
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={orderLoading}
          className="items-center rounded-2xl bg-[#a1d973] py-4"
        >
          {orderLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-white">
              {t('checkout.confirm')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
