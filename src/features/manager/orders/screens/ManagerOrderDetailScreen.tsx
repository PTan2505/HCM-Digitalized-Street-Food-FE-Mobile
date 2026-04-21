import { AnimatedBackdrop } from '@components/AnimatedBackdrop';
import { CustomOTPInput } from '@components/CustomOTPInput';
import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import type { User } from '@custom-types/user';
import { MANAGER_ORDER_STATUS } from '@features/manager/orders/api/managerOrderApi';
import {
  useCompleteManagerOrder,
  useDecideManagerOrder,
  useManagerOrderDetail,
} from '@features/manager/orders/hooks/useManagerOrders';
import { axiosApi } from '@lib/api/apiInstance';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { OtpInputRef } from 'react-native-otp-entry';
import { ProgressStep, ProgressSteps } from 'react-native-progress-steps';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

const getUserDisplayName = (user: User): string => {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return user.username ?? user.email ?? '—';
};

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2)
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const STEPS = [
  MANAGER_ORDER_STATUS.AwaitingVendorConfirmation,
  MANAGER_ORDER_STATUS.Paid,
  MANAGER_ORDER_STATUS.Complete,
] as const;

// ── Completion Code Modal ────────────────────────────────────────────────────

interface CompletionModalProps {
  visible: boolean;
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface CompletionForm {
  code: string;
}

const CompletionModal = ({
  visible,
  orderId,
  onClose,
  onSuccess,
}: CompletionModalProps): React.JSX.Element => {
  const { t } = useTranslation();
  const completeOrder = useCompleteManagerOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const otpRef = useRef<OtpInputRef>(null);
  const [backdropVisible, setBackdropVisible] = useState(visible);
  const closeBackdropTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const backdropProgress = useSharedValue(visible ? 1 : 0);

  const form = useForm<CompletionForm>({ defaultValues: { code: '' } });
  const code = form.watch('code');
  const isFilled = code.length >= 6;

  const resetAndClose = useCallback((): void => {
    form.reset();
    onClose();
  }, [form, onClose]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!isFilled) return;
    setIsSubmitting(true);
    try {
      await completeOrder.mutateAsync({
        orderId,
        data: { verificationCode: code },
      });
      form.reset();
      onSuccess();
    } catch (error) {
      Alert.alert(t('auth.error'), String(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [isFilled, code, completeOrder, orderId, form, onSuccess, t]);

  useEffect(() => {
    if (visible) {
      if (closeBackdropTimeoutRef.current) {
        clearTimeout(closeBackdropTimeoutRef.current);
        closeBackdropTimeoutRef.current = null;
      }
      setBackdropVisible(true);
      backdropProgress.value = withTiming(1, { duration: 220 });
      return;
    }

    backdropProgress.value = withTiming(0, { duration: 220 });
    closeBackdropTimeoutRef.current = setTimeout(() => {
      setBackdropVisible(false);
      closeBackdropTimeoutRef.current = null;
    }, 220);
  }, [backdropProgress, visible]);

  useEffect((): (() => void) => {
    return (): void => {
      if (closeBackdropTimeoutRef.current) {
        clearTimeout(closeBackdropTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return (): void => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) setKeyboardHeight(0);
  }, [visible]);

  return (
    <>
      <AnimatedBackdrop
        mounted={backdropVisible}
        visible={visible}
        onPress={onClose}
        progress={backdropProgress}
      />
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={resetAndClose}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={resetAndClose} />
        <View
          style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
          pointerEvents="box-none"
        >
          <View
            className="rounded-t-3xl bg-white px-6 pt-6"
            style={{ paddingBottom: 40 + keyboardHeight }}
          >
            <View className="mb-6 h-1 w-10 self-center rounded-full bg-gray-200" />

            <Text className="title-md mb-1 text-center text-gray-900">
              {t('manager_orders.mark_complete')}
            </Text>
            <Text className="mb-6 text-center text-sm font-normal text-gray-500">
              {t('manager_orders.enter_completion_code')}
            </Text>

            <FormProvider {...form}>
              <CustomOTPInput<CompletionForm>
                ref={otpRef}
                name="code"
                label=""
                numberOfDigits={6}
              />
            </FormProvider>

            <TouchableOpacity
              className={`mb-3 mt-6 items-center rounded-full py-4 ${isFilled && !isSubmitting ? 'bg-primary' : 'bg-gray-200'}`}
              disabled={!isFilled || isSubmitting}
              onPress={() => {
                void handleSubmit();
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`text-base font-bold ${isFilled ? 'text-white' : 'text-gray-400'}`}
                >
                  {t('manager_orders.submit')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center py-2"
              onPress={resetAndClose}
            >
              <Text className="text-sm font-medium text-gray-400">
                {t('manager_orders.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────

export const ManagerOrderDetailScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const route = useRoute();
  const params = route.params as { orderId: number };

  const { order, isLoading } = useManagerOrderDetail(params.orderId);
  const decideOrder = useDecideManagerOrder();

  const [customerName, setCustomerName] = useState<string>('—');
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    if (!order?.userId) return;
    axiosApi.userProfileApi
      .getUserById(order.userId)
      .then((user: User) => {
        setCustomerName(getUserDisplayName(user));
        if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
      })
      .catch(() => {
        setCustomerName(order.displayName ?? '—');
      });
  }, [order?.userId, order?.displayName]);

  const handleApprove = useCallback(async (): Promise<void> => {
    if (!order) return;
    setIsActioning(true);
    try {
      await decideOrder.mutateAsync({
        orderId: order.orderId,
        data: { approve: true },
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('auth.error'), String(error));
    } finally {
      setIsActioning(false);
    }
  }, [order, decideOrder, navigation, t]);

  const handleReject = useCallback((): void => {
    if (!order) return;
    Alert.alert(
      t('manager_orders.confirm_reject'),
      t('manager_orders.confirm_reject_message'),
      [
        { text: t('manager_orders.cancel'), style: 'cancel' },
        {
          text: t('manager_orders.reject'),
          style: 'destructive',
          onPress: async (): Promise<void> => {
            setIsActioning(true);
            try {
              await decideOrder.mutateAsync({
                orderId: order.orderId,
                data: { approve: false },
              });
              navigation.goBack();
            } catch (error) {
              Alert.alert(t('auth.error'), String(error));
            } finally {
              setIsActioning(false);
            }
          },
        },
      ]
    );
  }, [order, decideOrder, navigation, t]);

  if (isLoading || !order) {
    return (
      <SafeAreaView edges={[]} className="flex-1 bg-gray-50">
        <Header
          title={t('manager_orders.order_detail')}
          onBackPress={() => {
            navigation.goBack();
          }}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      </SafeAreaView>
    );
  }

  const isPending =
    order.status === MANAGER_ORDER_STATUS.AwaitingVendorConfirmation;
  const isPaid = order.status === MANAGER_ORDER_STATUS.Paid;
  const isComplete = order.status === MANAGER_ORDER_STATUS.Complete;
  const showActions = isPending || isPaid;
  const currentStep = STEPS.findIndex((s) => s === order.status);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      <Header
        title={`${t('manager_orders.order_detail')} #${order.orderId}`}
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: showActions ? 100 : 24 }}
      >
        {/* Step Indicator */}
        {currentStep >= 0 && (
          <View
            className="border-b border-gray-100 bg-white"
            style={{ height: 120 }}
          >
            <ProgressSteps
              activeStep={isComplete ? STEPS.length - 1 : currentStep}
              isComplete={isComplete}
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
              <ProgressStep
                label={t('manager_orders.step_awaiting')}
                removeBtnRow
              />
              <ProgressStep
                label={t('manager_orders.step_preparing')}
                removeBtnRow
              />
              <ProgressStep
                label={t('manager_orders.step_complete')}
                removeBtnRow
              />
            </ProgressSteps>
          </View>
        )}

        {/* Customer */}
        <View className="mx-4 mb-4 mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
            {t('manager_orders.customer_details')}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Text className="text-base font-bold text-primary">
                {getInitials(customerName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">
                {customerName}
              </Text>
              {customerPhone && (
                <Text className="mt-0.5 text-sm font-medium text-gray-500">
                  {customerPhone}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Order meta */}
        <View className="mx-4 mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <View className="mb-2 flex-row justify-between">
            <Text className="text-sm font-medium text-gray-500">
              {t('manager_orders.order_type')}
            </Text>
            <Text className="text-sm font-semibold text-gray-900">
              {order.isTakeAway
                ? t('manager_orders.takeaway')
                : t('manager_orders.dine_in')}
            </Text>
          </View>
          {order.table && (
            <View className="mb-2 flex-row justify-between">
              <Text className="text-sm font-medium text-gray-500">
                {t('manager_orders.table')}
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                {order.table}
              </Text>
            </View>
          )}
          {order.paymentMethod && (
            <View className="flex-row justify-between">
              <Text className="text-sm font-medium text-gray-500">
                {t('manager_orders.payment_method')}
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                {order.paymentMethod}
              </Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View className="mx-4 mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
            {t('manager_orders.order_items')}
          </Text>
          <View className="gap-3">
            {order.items.map((item) => (
              <View
                key={item.dishId}
                className="flex-row items-start justify-between"
              >
                <View className="mr-3 flex-1 flex-row items-start gap-2">
                  <Text className="text-sm font-bold text-primary">
                    {item.quantity}×
                  </Text>
                  <Text
                    className="flex-1 text-sm font-semibold text-gray-900"
                    numberOfLines={2}
                  >
                    {item.dishName}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* Price summary */}
          <View className="mt-4 gap-2 border-t border-gray-100 pt-4">
            <View className="flex-row justify-between">
              <Text className="text-sm font-medium text-gray-500">
                {t('manager_orders.subtotal')}
              </Text>
              <Text className="text-sm font-medium text-gray-700">
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>
            {order.discountAmount != null && order.discountAmount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-gray-500">
                  {t('manager_orders.discount')}
                </Text>
                <Text className="text-sm font-medium text-secondary">
                  -{formatCurrency(order.discountAmount)}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between border-t border-gray-100 pt-2">
              <Text className="text-base font-bold text-gray-900">
                {t('manager_orders.total')}
              </Text>
              <Text className="text-base font-extrabold text-gray-900">
                {formatCurrency(order.finalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Note */}
        {order.note && (
          <View className="mx-4 mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Text className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-400">
              {t('manager_orders.note')}
            </Text>
            <Text className="text-sm font-normal text-gray-700">
              {order.note}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {showActions && (
        <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-gray-100 bg-white/95 px-4 pb-8 pt-4">
          {isPending && (
            <>
              <TouchableOpacity
                className="flex-1 items-center rounded-full bg-gray-100 py-3"
                disabled={isActioning}
                onPress={handleReject}
              >
                <Text className="text-sm font-bold text-gray-700">
                  {isActioning
                    ? t('manager_orders.rejecting')
                    : t('manager_orders.reject')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-full py-3 ${isActioning ? 'bg-primary/50' : 'bg-primary'}`}
                disabled={isActioning}
                onPress={() => {
                  void handleApprove();
                }}
              >
                {isActioning ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-sm font-bold text-white">
                    {t('manager_orders.approve')}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
          {isPaid && (
            <TouchableOpacity
              className="flex-1 items-center rounded-full bg-primary py-3"
              onPress={() => {
                setShowCompleteModal(true);
              }}
            >
              <Text className="text-sm font-bold text-white">
                {t('manager_orders.mark_complete')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Completion Code Modal */}
      <CompletionModal
        visible={showCompleteModal}
        orderId={order.orderId}
        onClose={() => {
          setShowCompleteModal(false);
        }}
        onSuccess={() => {
          setShowCompleteModal(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};
