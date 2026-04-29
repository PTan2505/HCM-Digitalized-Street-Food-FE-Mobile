import { COLORS } from '@constants/colors';
import type { CampaignVoucherInfo } from '@features/customer/campaigns/types/generated/vendorCampaignBranch';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

cssInterop(LinearGradient, { className: 'style' });

interface VoucherListProps {
  vouchers: CampaignVoucherInfo[];
}

const formatDiscount = (value: number, type: string): string => {
  if (type.toUpperCase() === 'PERCENT') return `-${value}%`;
  return `-${value.toLocaleString('vi-VN')}đ`;
};

const VoucherItem = ({ item }: { item: CampaignVoucherInfo }): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  return (
    <TouchableOpacity
      className="mr-3 w-[200px] overflow-hidden rounded-2xl shadow-sm"
      style={{ height: 100 }}
      onPress={() => {
        console.log(item.campaignId);

        navigation.navigate('RestaurantCampaignDetail', {
          campaignId: String(item.campaignId),
        });
      }}
    >
      <LinearGradient
        colors={[COLORS.primaryGradientFrom, COLORS.primaryGradientTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        className="flex-row"
        style={{ flex: 1 }}
      >
        {/* Left stub */}
        <View className="relative w-[56px] items-center justify-center bg-[rgba(137,209,81,0.8)] px-1 py-3">
          <View className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-white" />
          <View className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-white" />
          <View className="absolute bottom-3 right-0 top-3 border-r-2 border-dashed border-white/60" />
          <View style={{ transform: [{ rotate: '-90deg' }] }}>
            <Text className="text-xs font-extrabold leading-tight text-black">
              {formatDiscount(item.discountValue, item.type)}
            </Text>
          </View>
        </View>

        {/* Right content */}
        <View className="flex-1 px-2.5 py-2">
          <Text
            className="my-1 text-[11px] font-bold text-black/90"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          {item.remain > 0 && (
            <Text className="text-[9px] text-black/70">
              {t('voucher.remain', {
                count: item.remain,
                defaultValue: `Còn: ${item.remain}`,
              })}
            </Text>
          )}

          <View className="mt-1.5 gap-0.5">
            {!!item.minAmountRequired && (
              <Text className="text-[9px] text-black/70">
                {t('cart.voucher_min_required', {
                  amount: item.minAmountRequired.toLocaleString('vi-VN'),
                  defaultValue: `Đơn tối thiểu ${item.minAmountRequired.toLocaleString('vi-VN')}đ`,
                })}
              </Text>
            )}
            {!!item.maxDiscountValue && (
              <Text className="text-[9px] text-black/70">
                {t('cart.voucher_max_discount', {
                  amount: item.maxDiscountValue.toLocaleString('vi-VN'),
                  defaultValue: `Tối đa ${item.maxDiscountValue.toLocaleString('vi-VN')}đ`,
                })}
              </Text>
            )}
            <Text className="text-[9px] text-black/70">
              {t('cart.voucher_expires', {
                date: new Date(item.endDate).toLocaleDateString('vi-VN'),
                defaultValue: `HSD: ${new Date(item.endDate).toLocaleDateString('vi-VN')}`,
              })}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const VoucherList = ({ vouchers }: VoucherListProps): JSX.Element | null => {
  const { t } = useTranslation();

  if (vouchers.length === 0) return null;

  return (
    <View className="py-3">
      <Text className="mb-2 px-4 text-xl font-bold text-gray-700">
        {t('voucher.branch_voucher')}
      </Text>
      <FlatList
        data={vouchers}
        keyExtractor={(v, i) => `${v.voucherId}-${i}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 100 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => <VoucherItem item={item} />}
      />
    </View>
  );
};

export default VoucherList;
