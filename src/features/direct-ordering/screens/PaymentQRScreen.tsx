import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentSocket } from '@features/direct-ordering/hooks/usePaymentSocket';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  CommonActions,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native';
import {
  cancelOrderThunk,
  clearCart,
  confirmPaymentThunk,
  fetchCartThunk,
  selectActiveOrder,
  selectCheckoutOrderCode,
} from '@slices/directOrdering';
import * as Sharing from 'expo-sharing';
import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

type PaymentQRScreenProps = StaticScreenProps<{
  orderId: number;
  qrCode: string;
  totalAmount: number;
  branchName: string;
  bin?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
}>;

export const PaymentQRScreen = ({
  route,
}: PaymentQRScreenProps): JSX.Element => {
  const {
    orderId,
    qrCode,
    totalAmount,
    branchName,
    bin,
    accountNumber,
    accountName,
  } = route.params;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const orderCode = useAppSelector(selectCheckoutOrderCode);
  const activeOrder = useAppSelector(selectActiveOrder);
  const { paymentStatus } = usePaymentSocket(orderCode);
  const orderCodeRef = useRef(orderCode);
  const branchIdRef = useRef(activeOrder?.branchId ?? 0);
  const screenShotRef = useRef<ViewShot>(null);
  const cancelledRef = useRef(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    orderCodeRef.current = orderCode;
  }, [orderCode]);

  // After a successful payment, replace everything from PersonalCart onward
  // with OrderStatusScreen so the user cannot swipe back into the cart/QR flow.
  // Must set cancelledRef first to stop the beforeRemove listener from firing
  // a cancel on the already-paid order.
  const navigateToOrderStatusAfterPayment = useCallback(() => {
    cancelledRef.current = true;
    navigation.dispatch((state) => {
      const personalCartIndex = state.routes.findIndex(
        (r) => r.name === 'PersonalCart'
      );
      const sliceAt =
        personalCartIndex >= 0 ? personalCartIndex : state.routes.length - 1;
      const routes = [
        ...state.routes.slice(0, sliceAt),
        { name: 'OrderStatus', params: { orderId, branchName } },
      ];
      return CommonActions.reset({
        ...state,
        routes,
        index: routes.length - 1,
      });
    });
  }, [navigation, orderId, branchName]);

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
            navigateToOrderStatusAfterPayment();
          } else if (
            result.paymentStatus === 'CANCELLED' ||
            result.paymentStatus === 'EXPIRED'
          ) {
            dispatch(fetchCartThunk(branchIdRef.current));
            Alert.alert(t('auth.error'), t('checkout.payment_failed'));
          }
        })
        .catch(() => {});
    });

    return (): void => {
      subscription.remove();
    };
  }, [dispatch, navigateToOrderStatusAfterPayment, t]);

  useEffect(() => {
    if (paymentStatus === 'PAID') {
      dispatch(clearCart());
      navigateToOrderStatusAfterPayment();
    } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') {
      dispatch(fetchCartThunk(branchIdRef.current));
      Alert.alert(t('auth.error'), t('checkout.payment_failed'));
    }
  }, [paymentStatus, dispatch, navigateToOrderStatusAfterPayment, t]);

  const handleShare = useCallback(async () => {
    if (!screenShotRef.current?.capture) return;
    setSharing(true);
    try {
      const uri = await screenShotRef.current.capture();
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

  // Covers swipe-back: fire-and-forget cancel without blocking navigation
  useEffect(() => {
    return navigation.addListener('beforeRemove', () => {
      if (cancelledRef.current) return;
      cancelledRef.current = true;
      dispatch(cancelOrderThunk(orderId))
        .unwrap()
        .then(() => dispatch(fetchCartThunk(branchIdRef.current)))
        .catch(() => {});
    });
  }, [navigation, dispatch, orderId]);

  const handleBack = useCallback(() => {
    if (cancelledRef.current) {
      navigation.goBack();
      return;
    }
    cancelledRef.current = true;
    dispatch(cancelOrderThunk(orderId))
      .unwrap()
      .then(() => {
        dispatch(fetchCartThunk(branchIdRef.current));
        navigation.goBack();
      })
      .catch(() => {
        navigation.goBack();
      });
  }, [dispatch, navigation, orderId]);

  const handleViewOrder = useCallback(() => {
    navigation.navigate('OrderStatus', { orderId, branchName });
  }, [navigation, orderId, branchName]);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header title={t('checkout.payment_qr_title')} onBackPress={handleBack} />

      <View className="flex-1 items-center justify-center px-6">
        {/* Instruction */}
        <Text className="mb-6 text-center text-base text-gray-500">
          {t('checkout.payment_qr_instruction')}
        </Text>
        {/* Everything above the buttons is captured as a screenshot */}
        <ViewShot
          ref={screenShotRef}
          options={{ format: 'png', quality: 1 }}
          style={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: 'white',
            paddingBottom: 16,
          }}
        >
          {/* QR Code */}
          <View>
            {bin && accountNumber ? (
              <Image
                source={{
                  uri: `https://img.vietqr.io/image/${bin}-${accountNumber}-compact.png?amount=${totalAmount}&addInfo=${encodeURIComponent(`Thanh toan don hang ${orderId}`.slice(0, 25))}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ''}`,
                }}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
              />
            ) : (
              <QRCode value={qrCode} size={300} />
            )}
          </View>

          {/* Amount */}
          <View className="mt-6 items-center">
            <Text className="text-base text-gray-400">{t('cart.total')}</Text>
            <Text className="mt-1 text-2xl font-bold text-[#00B14F]">
              {totalAmount.toLocaleString('vi-VN')}₫
            </Text>
          </View>

          {/* Branch name */}
          <Text className="mt-2 text-base text-gray-400">{branchName}</Text>

          {/* Order ID */}
          <View className="mt-3 flex-row items-center gap-1">
            <Text className="text-sm text-gray-400">
              {t('checkout.payment_qr_order_id')}:
            </Text>
            <Text className="text-sm font-semibold text-gray-600">
              #{orderId}
            </Text>
          </View>
        </ViewShot>

        {/* Action Buttons — excluded from screenshot */}
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
                <Text className="text-base font-semibold text-primary-light">
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
            <Text className="text-base font-semibold text-white">
              {t('checkout.payment_qr_view_order')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
