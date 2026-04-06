import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@constants/colors';
import { usePaymentSocket } from '@features/direct-ordering/hooks/usePaymentSocket';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearCart,
  confirmPaymentThunk,
  fetchCartThunk,
  selectCheckoutOrderCode,
} from '@slices/directOrdering';
import { useNavigation, StaticScreenProps } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  AppState,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
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
  const orderCodeRef = useRef(orderCode);
  const qrShotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    orderCodeRef.current = orderCode;
  }, [orderCode]);

  // Fallback: if SignalR missed the event while app was backgrounded,
  // manually confirm payment status when user returns to the app.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || !orderCodeRef.current) return;
      dispatch(confirmPaymentThunk({ orderCode: orderCodeRef.current }))
        .unwrap()
        .then((result) => {
          if (result.paymentStatus === 'PAID') {
            dispatch(clearCart());
            navigation.navigate('OrderStatus', { orderId, branchName });
          } else if (
            result.paymentStatus === 'CANCELLED' ||
            result.paymentStatus === 'EXPIRED'
          ) {
            dispatch(fetchCartThunk());
            Alert.alert(t('auth.error'), t('checkout.payment_failed'));
          }
        })
        .catch(() => {});
    });

    return (): void => {
      subscription.remove();
    };
  }, [dispatch, navigation, orderId, branchName, t]);

  useEffect(() => {
    if (paymentStatus === 'PAID') {
      dispatch(clearCart());
      navigation.navigate('OrderStatus', { orderId, branchName });
    } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') {
      dispatch(fetchCartThunk());
      Alert.alert(t('auth.error'), t('checkout.payment_failed'));
    }
  }, [paymentStatus, dispatch, navigation, orderId, branchName, t]);

  const handleShare = useCallback(async () => {
    if (!qrShotRef.current?.capture) return;
    setSharing(true);
    try {
      const uri = await qrShotRef.current.capture();
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(t('auth.error'), t('checkout.payment_qr_share_error'));
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: t('checkout.payment_qr_share'),
      });
    } catch {
      Alert.alert(t('auth.error'), t('checkout.payment_qr_share_error'));
    } finally {
      setSharing(false);
    }
  }, [t]);

  const handleViewOrder = useCallback(() => {
    navigation.navigate('OrderStatus', { orderId, branchName });
  }, [navigation, orderId, branchName]);

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

        {/* QR Code — wrapped in ViewShot for capture */}
        <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <ViewShot ref={qrShotRef} options={{ format: 'png', quality: 1 }}>
            <QRCode value={qrCode} size={220} />
          </ViewShot>
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

        {/* Order ID */}
        <View className="mt-3 flex-row items-center gap-1">
          <Text className="text-xs text-gray-400">
            {t('checkout.payment_qr_order_id')}:
          </Text>
          <Text className="text-xs font-semibold text-gray-600">
            #{orderId}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="mt-8 w-full gap-3">
          <TouchableOpacity
            onPress={handleShare}
            disabled={sharing}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-primary py-3.5"
          >
            {sharing ? (
              <ActivityIndicator size="small" color={COLORS.primaryLight} />
            ) : (
              <>
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={COLORS.primaryLight}
                />
                <Text className="text-sm font-semibold text-primary-light">
                  {t('checkout.payment_qr_share')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewOrder}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-3.5"
          >
            <Ionicons name="receipt-outline" size={20} color="#fff" />
            <Text className="text-sm font-semibold text-white">
              {t('checkout.payment_qr_view_order')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
