import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ORDER_STATUS } from '@features/customer/direct-ordering/api/cartApi';
import { useCancelOrderMutation } from '@features/customer/direct-ordering/hooks/useCancelOrderMutation';
import { useConfirmPaymentMutation } from '@features/customer/direct-ordering/hooks/useConfirmPaymentMutation';
import { useOrderQuery } from '@features/customer/direct-ordering/hooks/useOrderQuery';
import { usePaymentSocket } from '@features/customer/direct-ordering/hooks/usePaymentSocket';
import { queryKeys } from '@lib/queryKeys';
import {
  CommonActions,
  StaticScreenProps,
  useNavigation,
} from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import * as Sharing from 'expo-sharing';
import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';

export type PaymentQRMode = 'order' | 'subscription' | 'campaign';

type PaymentQRScreenProps = StaticScreenProps<{
  orderId: number;
  branchId: number;
  orderCode?: number | null;
  totalAmount: number;
  branchName: string;
  bin?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  /**
   * 'order' (default) — direct customer order; back triggers cancelOrder.
   * 'subscription' — vendor branch subscription payment; back leaves the order alone.
   * 'campaign' — vendor joining a system campaign; back leaves the order alone.
   */
  mode?: PaymentQRMode;
  /** Optional override for the QR description (max 25 chars). Defaults to "Thanh toan don hang {orderId}". */
  description?: string;
  /** When in subscription/campaign mode, route to navigate to after success. Defaults to going back to the previous screen. */
  successRouteName?: string;
  /** Required when mode === 'campaign' — the system campaign id to invalidate after success. */
  campaignId?: number;
}>;

export const PaymentQRScreen = ({
  route,
}: PaymentQRScreenProps): JSX.Element => {
  const {
    orderId,
    branchId,
    orderCode,
    totalAmount,
    branchName,
    bin,
    accountNumber,
    accountName,
    mode = 'order',
    description,
    successRouteName,
    campaignId,
  } = route.params;
  const isSubscription = mode === 'subscription';
  const isCampaign = mode === 'campaign';
  const isNonOrder = isSubscription || isCampaign;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { order: activeOrder } = useOrderQuery(isNonOrder ? 0 : orderId);
  const { cancelOrder } = useCancelOrderMutation();
  const { confirmPayment } = useConfirmPaymentMutation();
  const { paymentStatus, isSocketConnected, hasAttemptedConnection } =
    usePaymentSocket(orderCode ?? null);
  const orderCodeRef = useRef(orderCode ?? null);
  const screenShotRef = useRef<ViewShot>(null);
  const cancelledRef = useRef(false);
  // Prevents double-handling when both AppState fallback and polling resolve
  // concurrently (or when the socket event and a fallback path race).
  const handlingPaymentRef = useRef(false);
  const [sharing, setSharing] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    orderCodeRef.current = orderCode ?? null;
  }, [orderCode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return (): void => clearInterval(timer);
  }, []);

  const pendingCountdownText = useMemo(() => {
    if (isNonOrder) return null;
    if (activeOrder?.status !== ORDER_STATUS.Pending) {
      return null;
    }

    const baseTime = new Date(
      activeOrder.updatedAt ?? activeOrder.createdAt
    ).getTime();
    const expiresAt = baseTime + 10 * 60 * 1000;
    const remainingMs = Math.max(0, expiresAt - now);

    if (remainingMs === 0) {
      return t('checkout.payment_qr_expired');
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    return t('checkout.payment_qr_expires_in', {
      time: `${minutes}:${seconds}`,
    });
  }, [activeOrder, now, t, isNonOrder]);
  const isPendingCountdownExpired =
    pendingCountdownText === t('checkout.payment_qr_expired');

  // After a successful payment, replace everything from PersonalCart onward
  // with OrderStatusScreen so the user cannot swipe back into the cart/QR flow.
  // Must set cancelledRef first to stop the beforeRemove listener from firing
  // a cancel on the already-paid order.
  const navigateToOrderStatusAfterPayment = useCallback(() => {
    cancelledRef.current = true;
    navigation.dispatch((state) => {
      const routes = [
        ...state.routes.slice(0, -3),
        { name: 'OrderStatus', params: { orderId, branchName } },
      ];
      return CommonActions.reset({
        ...state,
        routes,
        index: routes.length - 1,
      });
    });
  }, [navigation, orderId, branchName]);

  // Subscription / campaign success: just pop back to caller (or navigate to a configured route).
  const navigateAfterNonOrderPayment = useCallback(() => {
    cancelledRef.current = true;
    if (successRouteName) {
      navigation.dispatch((state) => {
        const routes = [
          ...state.routes.slice(0, -1),
          { name: successRouteName },
        ];
        return CommonActions.reset({
          ...state,
          routes,
          index: routes.length - 1,
        });
      });
      return;
    }
    navigation.goBack();
  }, [navigation, successRouteName]);

  const invalidateCart = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.cart.byBranch(branchId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart.my });
  }, [queryClient, branchId]);

  const invalidateBranchAfterSubscription = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.vendorBranches.all,
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.managerBranch.all,
    });
  }, [queryClient]);

  const invalidateCampaignAfterJoin = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.managerCampaigns.systemJoinable(),
    });
    if (campaignId !== undefined) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.systemDetail(campaignId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerCampaigns.branches(campaignId, true),
      });
    }
  }, [queryClient, campaignId]);

  const handlePaidSuccess = useCallback(() => {
    if (isCampaign) {
      invalidateCampaignAfterJoin();
      navigateAfterNonOrderPayment();
    } else if (isSubscription) {
      invalidateBranchAfterSubscription();
      navigateAfterNonOrderPayment();
    } else {
      invalidateCart();
      navigateToOrderStatusAfterPayment();
    }
  }, [
    isCampaign,
    isSubscription,
    invalidateCampaignAfterJoin,
    invalidateBranchAfterSubscription,
    invalidateCart,
    navigateAfterNonOrderPayment,
    navigateToOrderStatusAfterPayment,
  ]);

  // Fallback: if SignalR missed the event while app was backgrounded,
  // manually confirm payment status when user returns to the app.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || !orderCodeRef.current) return;
      confirmPayment({ orderCode: orderCodeRef.current })
        .then((result) => {
          if (cancelledRef.current || handlingPaymentRef.current) return;
          if (result.paymentStatus === 'PAID') {
            handlingPaymentRef.current = true;
            handlePaidSuccess();
          } else if (
            result.paymentStatus === 'CANCELLED' ||
            result.paymentStatus === 'EXPIRED'
          ) {
            handlingPaymentRef.current = true;
            if (!isNonOrder) invalidateCart();
            Alert.alert(t('auth.error'), t('checkout.payment_failed'));
          }
        })
        .catch(() => {});
    });

    return (): void => {
      subscription.remove();
    };
  }, [confirmPayment, invalidateCart, handlePaidSuccess, isNonOrder, t]);

  // Polling fallback: only active after the socket has had a chance to connect
  // and failed. Stops automatically when the socket recovers (isSocketConnected
  // becomes true, causing the effect to re-run and clear the interval).
  useEffect(() => {
    if (!hasAttemptedConnection || isSocketConnected || !orderCode) return;

    const interval = setInterval(() => {
      if (cancelledRef.current || handlingPaymentRef.current) {
        clearInterval(interval);
        return;
      }
      confirmPayment({ orderCode })
        .then((result) => {
          if (cancelledRef.current || handlingPaymentRef.current) return;
          if (result.paymentStatus === 'PAID') {
            handlingPaymentRef.current = true;
            handlePaidSuccess();
          } else if (
            result.paymentStatus === 'CANCELLED' ||
            result.paymentStatus === 'EXPIRED'
          ) {
            handlingPaymentRef.current = true;
            if (!isNonOrder) invalidateCart();
            Alert.alert(t('auth.error'), t('checkout.payment_failed'));
          }
        })
        .catch(() => {});
    }, 5_000);

    return (): void => clearInterval(interval);
  }, [
    hasAttemptedConnection,
    isSocketConnected,
    orderCode,
    confirmPayment,
    handlePaidSuccess,
    invalidateCart,
    isNonOrder,
    t,
  ]);

  useEffect(() => {
    if (paymentStatus === 'PAID') {
      handlePaidSuccess();
    } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') {
      if (!isNonOrder) invalidateCart();
      Alert.alert(t('auth.error'), t('checkout.payment_failed'));
    }
  }, [paymentStatus, invalidateCart, handlePaidSuccess, isNonOrder, t]);

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

  // Covers swipe-back: fire-and-forget cancel without blocking navigation.
  // Subscription / campaign modes do NOT cancel anything — user may want to return later.
  useEffect(() => {
    if (isNonOrder) return;
    return navigation.addListener('beforeRemove', () => {
      if (cancelledRef.current) return;
      cancelledRef.current = true;
      cancelOrder(orderId)
        .then(() => invalidateCart())
        .catch(() => {});
    });
  }, [navigation, cancelOrder, orderId, invalidateCart, isNonOrder]);

  const handleBack = useCallback(() => {
    if (isNonOrder) {
      navigation.goBack();
      return;
    }
    if (cancelledRef.current) {
      navigation.goBack();
      return;
    }
    cancelledRef.current = true;
    cancelOrder(orderId)
      .then(() => {
        invalidateCart();
        navigation.goBack();
      })
      .catch(() => {
        navigation.goBack();
      });
  }, [cancelOrder, navigation, orderId, invalidateCart, isNonOrder]);

  const handleViewOrder = useCallback(() => {
    if (isNonOrder) {
      navigation.goBack();
      return;
    }
    navigation.navigate('OrderStatus', { orderId, branchName });
  }, [navigation, orderId, branchName, isNonOrder]);

  const qrDescription = description
    ? description.slice(0, 25)
    : `Thanh toan don hang ${orderId}`.slice(0, 25);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header title={t('checkout.payment_qr_title')} onBackPress={handleBack} />

      <View className="flex-1 items-center justify-center px-6">
        {/* Instruction */}
        <Text className="mb-6 text-center text-base text-gray-500">
          {t('checkout.payment_qr_instruction')}
        </Text>
        {pendingCountdownText && (
          <Text
            className={`mb-4 text-center text-sm font-semibold ${isPendingCountdownExpired ? 'text-red-500' : 'text-[#00B14F]'}`}
          >
            {pendingCountdownText}
          </Text>
        )}
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
            <Image
              source={{
                uri: `https://img.vietqr.io/image/${bin}-${accountNumber}-compact.png?amount=${totalAmount}&addInfo=${encodeURIComponent(qrDescription)}${accountName ? `&accountName=${encodeURIComponent(accountName)}` : ''}`,
              }}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
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

          {!isNonOrder && (
            <TouchableOpacity
              onPress={handleViewOrder}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-3.5"
            >
              <Ionicons name="receipt-outline" size={20} color="#fff" />
              <Text className="text-base font-semibold text-white">
                {t('checkout.payment_qr_view_order')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
