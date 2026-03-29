import { Ionicons } from '@expo/vector-icons';
import { usePaymentSocket } from '@features/direct-ordering/hooks/usePaymentSocket';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearCart,
  fetchCartThunk,
  selectCheckoutOrderCode,
} from '@slices/directOrdering';
import { useNavigation, StaticScreenProps } from '@react-navigation/native';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentQRScreenProps = StaticScreenProps<{
  orderId: number;
  qrCode: string;
  totalAmount: number;
  branchName: string;
}>;

export const PaymentQRScreen = ({
  route,
}: PaymentQRScreenProps): JSX.Element => {
  const { orderId, qrCode, totalAmount, branchName } = route.params;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const orderCode = useAppSelector(selectCheckoutOrderCode);
  const { paymentStatus } = usePaymentSocket(orderCode);

  useEffect(() => {
    if (paymentStatus === 'PAID') {
      // Payment confirmed — clear cart from Redux (backend already cleared it)
      dispatch(clearCart());
      navigation.navigate('OrderStatus', { orderId, branchName });
    } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') {
      // Payment failed — re-fetch cart so user can try again
      dispatch(fetchCartThunk());
      Alert.alert(t('auth.error'), t('checkout.payment_failed'));
    }
  }, [paymentStatus, dispatch, navigation, orderId, branchName, t]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-black">
          {t('checkout.payment_qr_title')}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Instruction */}
        <Text className="mb-6 text-center text-sm text-gray-500">
          {t('checkout.payment_qr_instruction')}
        </Text>

        {/* QR Code */}
        <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <QRCode value={qrCode} size={220} />
        </View>

        {/* Amount */}
        <View className="mt-6 items-center">
          <Text className="text-sm text-gray-400">{t('cart.total')}</Text>
          <Text className="mt-1 text-2xl font-bold text-[#00B14F]">
            {totalAmount.toLocaleString('vi-VN')}₫
          </Text>
        </View>

        {/* Branch name */}
        <Text className="mt-2 text-sm text-gray-400">{branchName}</Text>
      </View>
    </SafeAreaView>
  );
};
