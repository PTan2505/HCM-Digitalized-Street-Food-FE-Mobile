import { Ionicons } from '@expo/vector-icons';
import {
  ORDER_STATUS,
  type OrderStatus,
} from '@features/direct-ordering/api/cartApi';
import { useOrderStatus } from '@features/direct-ordering/hooks/useOrderStatus';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
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
};

type OrderStatusScreenProps = StaticScreenProps<{
  orderId: number;
  branchName: string;
  readOnly?: boolean;
}>;

export const OrderStatusScreen = ({
  route,
}: OrderStatusScreenProps): JSX.Element => {
  const { orderId, branchName } = route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { order } = useOrderStatus(orderId);
  const prevStatusRef = useRef<OrderStatus | undefined>(undefined);

  useEffect(() => {
    if (!order || prevStatusRef.current === undefined) {
      prevStatusRef.current = order?.status;
      return;
    }
    const prev = prevStatusRef.current;
    prevStatusRef.current = order.status;

    if (prev !== order.status) {
      if (order.status === ORDER_STATUS.Paid) {
        Alert.alert('', t('order.confirmed_toast'));
      } else if (order.status === ORDER_STATUS.Cancelled) {
        Alert.alert('', t('order.rejected_message'));
      } else if (order.status === ORDER_STATUS.Complete) {
        Alert.alert('', t('order.ready_banner'));
      }
    }
  }, [order, t]);

  const getStatusLabel = (status: OrderStatus): string =>
    t(`order.status.${STATUS_KEY_MAP[status]}`);

  const getStepIndex = (): number => {
    if (!order) return 0;
    if (order.status === ORDER_STATUS.Cancelled) return -1;
    return STEPS.indexOf(order.status);
  };

  const currentStep = getStepIndex();

  if (!order) {
    return (
      <SafeAreaView
        edges={['top']}
        className="flex-1 items-center justify-center bg-white"
      >
        <ActivityIndicator size="large" color="#a1d973" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-black">
          {t('order.status_title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Branch Name */}
        <View className="border-b border-gray-100 px-4 py-4">
          <Text className="text-base font-bold text-black">{branchName}</Text>
          <Text className="mt-1 text-xs text-gray-400">
            {t('order.placed_at')}{' '}
            {new Date(order.createdAt).toLocaleString('vi-VN')}
          </Text>
        </View>

        {/* Step Indicator */}
        {currentStep >= 0 ? (
          <View className="px-6 py-6">
            {STEPS.map((step, index) => {
              const isActive = index <= currentStep;
              const isLast = index === STEPS.length - 1;
              return (
                <View key={step} className="flex-row">
                  <View className="items-center">
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-full ${
                        isActive ? 'bg-[#a1d973]' : 'bg-gray-200'
                      }`}
                    >
                      {isActive && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        className={`h-8 w-0.5 ${isActive ? 'bg-[#a1d973]' : 'bg-gray-200'}`}
                      />
                    )}
                  </View>
                  <Text
                    className={`ml-3 text-sm ${
                      isActive ? 'font-semibold text-black' : 'text-gray-400'
                    }`}
                  >
                    {getStatusLabel(step)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="items-center px-4 py-8">
            <Ionicons name="close-circle" size={48} color="#ef4444" />
            <Text className="mt-3 text-center text-base font-semibold text-gray-600">
              {t('order.rejected_message')}
            </Text>
          </View>
        )}

        {/* Items */}
        <View className="border-t border-gray-100 px-4 py-4">
          {order.items.map((item) => (
            <View
              key={item.dishId}
              className="mb-1 flex-row items-center justify-between"
            >
              <Text className="text-sm text-black">
                {item.dishName} × {item.quantity}
              </Text>
            </View>
          ))}
          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Text className="text-base font-bold text-black">
              {t('cart.total')}
            </Text>
            <Text className="text-lg font-bold text-[#00B14F]">
              {`${order.finalAmount.toLocaleString('vi-VN')}₫`}
            </Text>
          </View>
          {order.paymentMethod ? (
            <Text className="mt-1 text-xs text-gray-400">
              {t('order.payment_via')}{' '}
              {t(`order.payment_method.${order.paymentMethod}`)}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
