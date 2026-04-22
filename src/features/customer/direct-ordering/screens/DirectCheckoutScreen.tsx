import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { UserVoucherApiDto } from '@features/customer/campaigns/api/voucherApi';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
  checkoutThunk,
  clearOrderError,
  selectCart,
  selectOrderError,
  selectOrderLoading,
} from '@slices/directOrdering';
import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  branchId: number;
  branchName: string;
  note?: string;
}>;

const calculateDiscount = (
  voucher: UserVoucherApiDto,
  totalAmount: number
): number => {
  const isPercent =
    voucher.voucherType.toUpperCase() === 'PERCENT' ||
    voucher.voucherType.toUpperCase() === 'PERCENTAGE';
  let discount = isPercent
    ? (totalAmount * voucher.discountValue) / 100
    : voucher.discountValue;
  if (
    voucher.maxDiscountValue !== null &&
    discount > voucher.maxDiscountValue
  ) {
    discount = voucher.maxDiscountValue;
  }
  return Math.min(Math.max(discount, 0), totalAmount);
};

export const DirectCheckoutScreen = ({
  route,
}: DirectCheckoutScreenProps): JSX.Element => {
  const { branchId, branchName, note } = route.params;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const cart = useAppSelector(selectCart);
  const orderLoading = useAppSelector(selectOrderLoading);
  const orderError = useAppSelector(selectOrderError);
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [isTakeAway, setIsTakeAway] = useState(true);

  const [vouchers, setVouchers] = useState<UserVoucherApiDto[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] =
    useState<UserVoucherApiDto | null>(null);
  const hasAutoAppliedRef = useRef(false);

  useEffect(() => {
    if (!cart?.branchId) return;
    setVouchersLoading(true);
    axiosApi.voucherApi
      .getApplicableVouchers(cart.branchId)
      .then(setVouchers)
      .catch(() => setVouchers([]))
      .finally(() => setVouchersLoading(false));
  }, [cart?.branchId]);

  useEffect(() => {
    if (vouchers.length === 0 || hasAutoAppliedRef.current || !cart) return;
    hasAutoAppliedRef.current = true;
    const applicable = vouchers.filter(
      (v) =>
        v.minAmountRequired === null || cart.totalAmount >= v.minAmountRequired
    );
    if (applicable.length === 0) return;
    const best = applicable.reduce((a, b) =>
      calculateDiscount(a, cart.totalAmount) >=
      calculateDiscount(b, cart.totalAmount)
        ? a
        : b
    );
    setSelectedVoucher(best);
  }, [vouchers, cart]);

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

  const discountAmount = useMemo(() => {
    if (!selectedVoucher || !cart) return 0;
    return calculateDiscount(selectedVoucher, cart.totalAmount);
  }, [selectedVoucher, cart]);

  const finalAmount = useMemo(
    () => (cart ? cart.totalAmount - discountAmount : 0),
    [cart, discountAmount]
  );

  const getPaymentLabel = (key: string): string => {
    const labels: Record<string, string> = {
      wallet: t('checkout.wallet'),
      bank_transfer: t('checkout.bank_transfer'),
      viet_qr: t('checkout.viet_qr'),
    };
    return labels[key] ?? key;
  };

  const handleSelectVoucher = useCallback(
    (voucher: UserVoucherApiDto | null) => {
      setSelectedVoucher(voucher);
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert(t('auth.error'), t('checkout.empty_cart'));
      return;
    }

    try {
      const result = await dispatch(
        checkoutThunk({
          branchId: branchId,
          paymentMethod: selectedMethod,
          isTakeAway,
          note: note ?? null,
          voucherId: selectedVoucher?.voucherId ?? null,
        })
      ).unwrap();

      navigation.navigate('PaymentQR', {
        orderId: result.order.orderId,
        totalAmount: result.order.finalAmount,
        branchName,
        bin: result.payment.bin,
        accountNumber: result.payment.accountNumber,
        accountName: result.payment.accountName,
      });
    } catch {
      // Error is handled by the slice / useEffect above
    }
  }, [
    cart,
    t,
    dispatch,
    branchId,
    selectedMethod,
    isTakeAway,
    note,
    selectedVoucher?.voucherId,
    navigation,
    branchName,
  ]);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('checkout.order_summary')}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Order Summary */}
        <View className="border-b border-gray-100 px-4 py-4">
          <Text className="mb-2 text-lg font-bold text-black">
            {branchName}
          </Text>
          {cart?.items.map((item) => (
            <View
              key={item.dishId}
              className="mb-1 flex-row items-center justify-between"
            >
              <View className="mr-3 flex-1 flex-row items-center">
                {item.dishImageUrl ? (
                  <Image
                    source={{ uri: item.dishImageUrl }}
                    className="h-10 w-10 rounded-lg bg-gray-100"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Ionicons
                      name="restaurant-outline"
                      size={18}
                      color="#999"
                    />
                  </View>
                )}
                <Text
                  className="ml-3 flex-1 text-base text-black"
                  numberOfLines={1}
                >
                  {item.dishName} × {item.quantity}
                </Text>
              </View>
              <Text className="text-base font-semibold text-black">
                {`${item.lineTotal.toLocaleString('vi-VN')}đ`}
              </Text>
            </View>
          ))}
          {note ? (
            <Text className="mt-2 text-sm italic text-gray-400">
              {t('cart.note_label')}: {note}
            </Text>
          ) : null}
          <View className="mt-3 border-t border-gray-100 pt-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-gray-500">{t('cart.total')}</Text>
              <Text className="text-base text-black">
                {cart ? `${cart.totalAmount.toLocaleString('vi-VN')}₫` : '—'}
              </Text>
            </View>
            {discountAmount > 0 && (
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="text-base text-[#00B14F]">
                  {t('checkout.voucher_discount')}
                </Text>
                <Text className="text-base font-semibold text-[#00B14F]">
                  {`-${discountAmount.toLocaleString('vi-VN')}₫`}
                </Text>
              </View>
            )}
            <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-2">
              <Text className="text-lg font-bold text-black">
                {t('checkout.voucher_final_amount')}
              </Text>
              <Text className="text-lg font-bold text-[#00B14F]">
                {`${finalAmount.toLocaleString('vi-VN')}₫`}
              </Text>
            </View>
          </View>
        </View>

        {/* Voucher Row */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('VoucherSelect', {
              vouchers,
              totalAmount: cart?.totalAmount ?? 0,
              selectedVoucherId: selectedVoucher?.voucherId ?? null,
              onSelect: handleSelectVoucher,
            })
          }
          disabled={vouchersLoading}
          className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="pricetag-outline"
              size={20}
              color={COLORS.primaryLight}
            />
            <Text className="text-base font-semibold text-black">
              {t('checkout.voucher')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {vouchersLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : selectedVoucher ? (
              <View className="items-end">
                <Text
                  className="max-w-[160px] text-base font-semibold text-primary-light"
                  numberOfLines={1}
                >
                  {selectedVoucher.voucherName}
                </Text>
                <Text className="text-sm text-[#00B14F]">
                  {`-${discountAmount.toLocaleString('vi-VN')}₫`}
                </Text>
              </View>
            ) : (
              <Text className="text-base text-gray-400">
                {t('checkout.select_voucher')}
              </Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </View>
        </TouchableOpacity>

        {/* Take Away Toggle */}
        <TouchableOpacity
          onPress={() => setIsTakeAway(!isTakeAway)}
          className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4"
        >
          <Text className="text-base font-semibold text-black">Mang đi</Text>
          <View
            className={`h-5 w-5 items-end justify-end rounded border-2 ${isTakeAway ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`}
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
                  ? 'border-primary bg-[#f4fce3]'
                  : 'border-gray-200'
              }`}
            >
              <Ionicons
                name={method.icon}
                size={22}
                color={
                  selectedMethod === method.key ? COLORS.primaryLight : '#999'
                }
              />
              <Text
                className={`ml-3 flex-1 text-base font-semibold ${
                  selectedMethod === method.key
                    ? 'text-primary-light'
                    : 'text-black'
                }`}
              >
                {getPaymentLabel(method.key)}
              </Text>
              {selectedMethod === method.key && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primaryLight}
                />
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
          className="items-center rounded-2xl bg-primary py-4"
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
