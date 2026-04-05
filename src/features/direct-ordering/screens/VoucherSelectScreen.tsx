import { Ionicons } from '@expo/vector-icons';
import type { UserVoucherApiDto } from '@features/campaigns/api/voucherApi';
import { TicketVoucherCard } from '@features/campaigns/components/TicketVoucherCard';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type VoucherSelectScreenProps = StaticScreenProps<{
  vouchers: UserVoucherApiDto[];
  totalAmount: number;
  selectedUserVoucherId?: number | null;
  onSelect: (voucher: UserVoucherApiDto | null) => void;
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

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const VoucherSelectScreen = ({
  route,
}: VoucherSelectScreenProps): JSX.Element => {
  const { vouchers, totalAmount, selectedUserVoucherId, onSelect } =
    route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleSelect = useCallback(
    (voucher: UserVoucherApiDto | null) => {
      onSelect(voucher);
      navigation.goBack();
    },
    [onSelect, navigation]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-black">
          {t('checkout.select_voucher')}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* No voucher option */}
        <TouchableOpacity
          onPress={() => handleSelect(null)}
          className={`mb-4 flex-row items-center rounded-2xl border px-4 py-3.5 ${
            selectedUserVoucherId == null
              ? 'border-[#a1d973] bg-[#f4fce3]'
              : 'border-gray-200'
          }`}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={selectedUserVoucherId == null ? '#7AB82D' : '#999'}
          />
          <Text
            className={`ml-3 flex-1 text-sm font-semibold ${
              selectedUserVoucherId == null ? 'text-[#7AB82D]' : 'text-gray-500'
            }`}
          >
            {t('checkout.no_voucher')}
          </Text>
          {selectedUserVoucherId == null && (
            <Ionicons name="checkmark-circle" size={18} color="#7AB82D" />
          )}
        </TouchableOpacity>

        {/* Voucher list */}
        {vouchers.map((v) => {
          const isDisabled =
            v.minAmountRequired !== null && totalAmount < v.minAmountRequired;
          const isSelected = selectedUserVoucherId === v.userVoucherId;

          const isPercent =
            v.voucherType.toUpperCase() === 'PERCENT' ||
            v.voucherType.toUpperCase() === 'PERCENTAGE';

          const discountText = isPercent
            ? `-${v.discountValue}%`
            : `-${v.discountValue.toLocaleString('vi-VN')}₫`;

          const expiresDate = v.endDate ?? v.expiredDate;
          const expiresText = expiresDate
            ? t('checkout.voucher_expires', {
                date: formatDate(expiresDate),
              })
            : '';

          const secondaryMetaText = v.minAmountRequired
            ? t('checkout.voucher_min_required', {
                amount: `${v.minAmountRequired.toLocaleString('vi-VN')}₫`,
              })
            : t('checkout.voucher_no_min');

          const tertiaryMetaText =
            isPercent && v.maxDiscountValue !== null
              ? t('checkout.voucher_max_discount', {
                  amount: `${v.maxDiscountValue.toLocaleString('vi-VN')}₫`,
                })
              : undefined;

          const subtitle = isDisabled
            ? t('checkout.voucher_need_more', {
                amount: `${(v.minAmountRequired! - totalAmount).toLocaleString('vi-VN')}₫`,
              })
            : (v.description ?? undefined);

          const previewDiscount = !isDisabled
            ? calculateDiscount(v, totalAmount)
            : 0;

          const actionLabel = isDisabled
            ? undefined
            : isSelected
              ? t('checkout.voucher_selected')
              : `${t('checkout.voucher_apply')} (-${previewDiscount.toLocaleString('vi-VN')}₫)`;

          return (
            <TicketVoucherCard
              key={v.userVoucherId}
              disabled={isDisabled}
              discountText={discountText}
              title={v.voucherName}
              subtitle={subtitle}
              expiresText={expiresText}
              secondaryMetaText={secondaryMetaText}
              secondaryMetaIcon="bag-handle-outline"
              tertiaryMetaText={tertiaryMetaText}
              tertiaryMetaIcon="cash-outline"
              actionLabel={actionLabel}
              onActionPress={
                isDisabled ? undefined : (): void => handleSelect(v)
              }
              actionDisabled={isSelected}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
