import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import {
  ORDER_STATUS,
  type OrderStatus,
} from '@features/customer/direct-ordering/api/cartApi';
import { useCheckoutMutation } from '@features/customer/direct-ordering/hooks/useCheckoutMutation';
import { useOrderStatus } from '@features/customer/direct-ordering/hooks/useOrderStatus';
import { usePickupCode } from '@features/customer/direct-ordering/hooks/usePickupCode';
import { useBranchDisplayName } from '@hooks/useBranchDisplayName';
import { axiosApi } from '@lib/api/apiInstance';
import {
  CommonActions,
  StaticScreenProps,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProgressStep, ProgressSteps } from 'react-native-progress-steps';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS: OrderStatus[] = [
  ORDER_STATUS.Pending,
  ORDER_STATUS.AwaitingVendorConfirmation,
  ORDER_STATUS.Paid,
  ORDER_STATUS.Complete,
];

const STATUS_KEY_MAP: Record<OrderStatus, string> = {
  [ORDER_STATUS.Pending]: 'pending',
  [ORDER_STATUS.AwaitingVendorConfirmation]: 'awaitingVendorConfirmation',
  [ORDER_STATUS.Paid]: 'paid',
  [ORDER_STATUS.Complete]: 'complete',
  [ORDER_STATUS.Cancelled]: 'cancelled',
  [ORDER_STATUS.Expired]: 'expired',
};

type OrderStatusScreenProps = StaticScreenProps<{
  orderId: number;
  branchName: string;
  readOnly?: boolean;
}>;

export const OrderStatusScreen = ({
  route,
}: OrderStatusScreenProps): JSX.Element => {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { order } = useOrderStatus(orderId);
  const { pickupCode } = usePickupCode(orderId, order?.status);
  const { checkout } = useCheckoutMutation();
  const queryClient = useQueryClient();

  const orderReviewedQueryKey = ['feedback', 'order', orderId] as const;

  const { data: isOrderReviewed = false } = useQuery({
    queryKey: orderReviewedQueryKey,
    queryFn: async (): Promise<boolean> => {
      const result = await axiosApi.feedbackApi.getMyFeedback({
        pageSize: 100,
      });
      return result.items.some((f) => f.orderId === orderId);
    },
    enabled: order?.status === ORDER_STATUS.Complete,
    staleTime: 5 * 60 * 1000,
  });

  useFocusEffect(
    useCallback(() => {
      if (order?.status === ORDER_STATUS.Complete) {
        void queryClient.invalidateQueries({
          queryKey: ['feedback', 'order', orderId],
        });
      }
    }, [order?.status, queryClient, orderId])
  );
  const displayName = useBranchDisplayName(order?.branchId ?? 0);

  const getStepIndex = (): number => {
    if (!order) return 0;
    if (
      order.status === ORDER_STATUS.Cancelled ||
      order.status === ORDER_STATUS.Expired
    ) {
      return -1;
    }
    return STEPS.indexOf(order.status);
  };

  const currentStep = getStepIndex();

  if (!order) {
    return (
      <SafeAreaView
        edges={['top']}
        className="flex-1 items-center justify-center bg-white"
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const canRepay = order.status === ORDER_STATUS.Pending;

  const handleRepay = async (): Promise<void> => {
    if (!canRepay) {
      Alert.alert(t('auth.error'), t('checkout.payment_qr_unavailable'));
      return;
    }

    try {
      const result = await checkout({
        branchId: order.branchId,
        paymentMethod: order.paymentMethod ?? 'bank_transfer',
        isTakeAway: order.isTakeAway,
        note: null,
        voucherId: null,
      });

      if (!result.payment.bin || !result.payment.accountNumber) {
        Alert.alert(t('auth.error'), t('checkout.payment_qr_unavailable'));
        return;
      }

      navigation.navigate('PaymentQR', {
        orderId: result.order.orderId,
        branchId: order.branchId,
        orderCode: result.payment.orderCode,
        totalAmount: result.order.finalAmount,
        branchName: displayName ?? order.branchName,
        bin: result.payment.bin,
        accountNumber: result.payment.accountNumber,
        accountName: result.payment.accountName,
      });
    } catch {
      Alert.alert(t('auth.error'), t('checkout.payment_qr_unavailable'));
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}

      <Header
        title={t('order.status_title')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={{
          icon: <Ionicons name="home-outline" size={18} color="black" />,
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })
            );
          },
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Confirmation Banner */}
        <View className="border-b border-gray-100 px-4 pb-5 pt-4">
          <Text className="text-2xl font-bold text-black">
            {order.status === ORDER_STATUS.Cancelled
              ? t('order.cancelled_title')
              : order.status === ORDER_STATUS.Expired
                ? t('order.expired_title')
                : t('order.confirmed_title')}
          </Text>
          <Text className="mt-2 text-base font-semibold text-gray-700">
            {displayName ?? order.branchName}
          </Text>
          {order.table ? (
            <Text className="mt-1 text-base text-gray-500">
              {t('order.table_label')} {order.table}
            </Text>
          ) : (
            <Text className="mt-1 text-base text-gray-500">
              {t('order.take_away')}
            </Text>
          )}
          <Text className="mt-1 text-base text-gray-500">
            {t('order.date_label')} {formattedDate}
          </Text>
          <Text className="mt-1 text-base text-gray-500">
            {t('order.receipt_number')} #{order.orderId}
          </Text>
        </View>

        {/* Step Indicator */}
        {currentStep >= 0 ? (
          <View className="border-b border-gray-100" style={{ height: 120 }}>
            <ProgressSteps
              activeStep={currentStep}
              isComplete={order.status === ORDER_STATUS.Complete}
              labelFontSize={12}
              completedProgressBarColor={COLORS.primary}
              progressBarColor="#EBEBE4"
              activeStepIconBorderColor={COLORS.primary}
              completedStepIconColor={COLORS.primary}
              disabledStepIconColor="#EBEBE4"
              activeLabelColor={COLORS.primary}
              completedLabelColor={COLORS.primary}
              completedCheckColor="#fff"
              topOffset={16}
              marginBottom={0}
            >
              {STEPS.map((step) => (
                <ProgressStep
                  key={step}
                  label={t(`order.status.${STATUS_KEY_MAP[step]}`)}
                  removeBtnRow
                />
              ))}
            </ProgressSteps>
          </View>
        ) : (
          <View className="items-center border-b border-gray-100 px-4 py-8">
            <Ionicons
              name={
                order.status === ORDER_STATUS.Expired
                  ? 'timer-outline'
                  : 'close-circle'
              }
              size={48}
              color={
                order.status === ORDER_STATUS.Expired ? '#94a3b8' : '#ef4444'
              }
            />
            <Text className="mt-3 text-center text-base font-semibold text-gray-600">
              {order.status === ORDER_STATUS.Expired
                ? t('order.expired_message')
                : t('order.rejected_message')}
            </Text>
          </View>
        )}

        {/* Pickup Code */}
        {order.status === ORDER_STATUS.Paid && pickupCode && (
          <View className="mx-4 my-4 items-center rounded-2xl border border-primary bg-[#f6ffed] px-4 py-5">
            <Text className="text-base font-semibold text-gray-500">
              {t('order.pickup_code_label')}
            </Text>
            <Text className="mt-1 text-4xl font-bold tracking-widest text-black">
              {pickupCode.verificationCode}
            </Text>
          </View>
        )}

        {/* Items */}
        <View className="gap-4 border-b border-gray-100 px-4 py-4">
          {order.items.map((item, index) => (
            <View key={item.dishId} className="flex-row items-center">
              <Text className="text-base font-medium text-black">
                {index + 1}.
              </Text>
              <Text className="ml-4 flex-1 text-base font-medium text-black">
                {item.dishName}
              </Text>
              <Text className="ml-4 flex-1 text-base font-medium text-black">
                x{item.quantity}
              </Text>
              <Text className="text-base font-semibold text-black">
                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        {order.paymentMethod ? (
          <View className="border-b border-gray-100 px-4 py-4">
            <Text className="mb-3 text-base font-semibold text-gray-700">
              {t('order.payment_method_label')}
            </Text>
            <View className="flex-row items-center gap-2">
              <Ionicons name="card-outline" size={20} color="#333" />
              <Text className="text-base text-gray-700">
                {t(
                  `order.payment_method.${order.paymentMethod === 'Lowca Wallet' ? 'wallet' : 'bank_transfer'}`
                )}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Summary */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between py-1">
            <Text className="text-base text-gray-500">
              {t('order.subtotal')}
            </Text>
            <Text className="text-base text-black">
              {order.totalAmount.toLocaleString('vi-VN')}₫
            </Text>
          </View>
          {/* Voucher discount — will be expanded later */}
          {order.discountAmount != null && order.discountAmount > 0 ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-base text-gray-500">
                {t('order.discount')}
              </Text>
              <Text className="text-base text-[#00B14F]">
                -{order.discountAmount.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          ) : null}
          <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Text className="text-base font-bold text-black">
              {t('cart.total')}
            </Text>
            <Text className="text-lg font-bold text-[#00B14F]">
              {order.finalAmount.toLocaleString('vi-VN')}₫
            </Text>
          </View>
        </View>

        {order.status === ORDER_STATUS.Pending && (
          <View className="px-4 pb-4">
            <TouchableOpacity
              onPress={handleRepay}
              disabled={!canRepay}
              className={`items-center rounded-xl py-4 ${canRepay ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <Text
                className={`text-base font-semibold ${canRepay ? 'text-white' : 'text-gray-400'}`}
              >
                {t('order.re_pay')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Write Review — only shown for completed, unreviewed orders */}
        {order.status === ORDER_STATUS.Complete && (
          <View className="px-4 pb-4">
            {isOrderReviewed ? (
              <View className="flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 py-4">
                <Ionicons name="checkmark-circle" size={18} color="#6B7280" />
                <Text className="text-base font-semibold text-gray-400">
                  {t('review.already_reviewed', 'Đã đánh giá')}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={(): void =>
                  navigation.navigate('WriteReview', {
                    orderId: order.orderId,
                    branchId: order.branchId,
                  })
                }
                className="items-center rounded-xl bg-primary py-4"
              >
                <Text className="text-base font-semibold text-white">
                  {t('review.write', 'Viết đánh giá')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
