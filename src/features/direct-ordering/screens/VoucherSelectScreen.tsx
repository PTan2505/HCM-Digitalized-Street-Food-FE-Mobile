import { Ionicons } from '@expo/vector-icons';
import type { UserVoucherApiDto } from '@features/campaigns/api/voucherApi';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

export const VoucherSelectScreen = ({
  route,
}: VoucherSelectScreenProps): JSX.Element => {
  const { vouchers, totalAmount, selectedUserVoucherId, onSelect } =
    route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = useCallback(
    (voucher: UserVoucherApiDto | null) => {
      onSelect(voucher);
      navigation.goBack();
    },
    [onSelect, navigation]
  );

  const displayVouchers = useMemo(() => {
    const isDisabled = (v: UserVoucherApiDto): boolean =>
      v.minAmountRequired !== null && totalAmount < v.minAmountRequired;

    const sorted = [...vouchers].sort((a, b) => {
      const disabledA = isDisabled(a) ? 1 : 0;
      const disabledB = isDisabled(b) ? 1 : 0;
      if (disabledA !== disabledB) return disabledA - disabledB;
      const discountA = calculateDiscount(a, totalAmount);
      const discountB = calculateDiscount(b, totalAmount);
      return discountB - discountA;
    });
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter((v) => v.voucherName.toLowerCase().includes(q));
  }, [vouchers, totalAmount, searchQuery]);

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

      {/* Search bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-2.5">
          <Ionicons name="search-outline" size={16} color="#999" />
          <TextInput
            className="ml-2 flex-1 text-sm text-black"
            placeholder={t('checkout.voucher_search_placeholder')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {displayVouchers.map((v) => {
          const isDisabled =
            v.minAmountRequired !== null && totalAmount < v.minAmountRequired;
          const isSelected = selectedUserVoucherId === v.userVoucherId;
          const previewDiscount = calculateDiscount(v, totalAmount);

          // Title: Name + discount amount based on current order
          const savingsLabel =
            previewDiscount > 0
              ? t('checkout.voucher_saves', {
                  amount: `${previewDiscount.toLocaleString('vi-VN')}₫`,
                })
              : null;

          const titleText = `${v.voucherName} - ${v.voucherType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString('vi-VN')}₫`}`;

          // Subtitle: min required + need_more if disabled
          const minText = v.minAmountRequired
            ? t('checkout.voucher_min_required', {
                amount: `${v.minAmountRequired.toLocaleString('vi-VN')}₫`,
              })
            : t('checkout.voucher_no_min');
          const needMoreText = isDisabled
            ? t('checkout.voucher_need_more', {
                amount: `${(v.minAmountRequired! - totalAmount).toLocaleString('vi-VN')}₫`,
              })
            : null;
          const subtitleText = needMoreText
            ? `${minText} · ${needMoreText}`
            : minText;

          return (
            <TouchableOpacity
              key={v.userVoucherId}
              onPress={() => {
                if (!isDisabled) handleSelect(v);
              }}
              activeOpacity={isDisabled ? 1 : 0.7}
              className="flex-row items-center border-b border-gray-100 px-4 py-3"
            >
              {/* Left icon */}
              <View
                className={`h-14 w-14 items-center justify-center rounded-xl ${
                  isDisabled ? 'bg-gray-200' : 'bg-primary'
                }`}
              >
                <Ionicons
                  name="pricetag"
                  size={26}
                  color={isDisabled ? '#aaa' : '#fff'}
                />
              </View>

              <View className="flex-1 flex-row items-center justify-between">
                {/* Text content */}
                <View className="ml-3">
                  <Text
                    className={`text-sm font-bold leading-[18px] ${
                      isDisabled ? 'text-gray-400' : 'text-black'
                    }`}
                    numberOfLines={2}
                  >
                    {titleText}
                  </Text>
                  <Text
                    className={`mt-0.5 text-xs ${
                      isDisabled ? 'text-red-400' : 'text-gray-500'
                    }`}
                    numberOfLines={1}
                  >
                    {subtitleText}
                  </Text>
                </View>
                <Text className="text-secondary">{savingsLabel}</Text>
              </View>

              {/* Chevron */}
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#ccc"
                style={{ marginHorizontal: 4 }}
              />

              {/* Checkbox */}
              <View
                className={`h-5 w-5 items-center justify-center rounded border-2 ${
                  isSelected
                    ? 'border-primary-light bg-primary-light'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Skip button */}
      <View className="border-t border-gray-100 px-4 py-4">
        <TouchableOpacity
          onPress={() => handleSelect(null)}
          className="items-center py-2"
        >
          <Text className="text-sm font-semibold text-gray-500">
            {t('checkout.skip_voucher')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
