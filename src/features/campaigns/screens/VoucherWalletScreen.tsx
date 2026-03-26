import { Ionicons } from '@expo/vector-icons';
import { VoucherCard } from '@features/campaigns/components/VoucherCard';
import { useVoucherWallet } from '@features/campaigns/hooks/useVoucherWallet';
import { useNavigation } from '@react-navigation/native';
import type { Voucher } from '@slices/campaigns';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const VoucherWalletScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { activeVouchers, expiredVouchers } = useVoucherWallet();
  const [expandedVoucherId, setExpandedVoucherId] = useState<string | null>(
    null
  );

  const sections = [
    ...(activeVouchers.length > 0
      ? [{ title: t('campaign.voucher_active'), data: activeVouchers }]
      : []),
    ...(expiredVouchers.length > 0
      ? [{ title: t('campaign.voucher_expired'), data: expiredVouchers }]
      : []),
  ];

  const handleVoucherPress = useCallback(
    (voucher: Voucher) => {
      if (expandedVoucherId === voucher.voucherId) {
        setExpandedVoucherId(null);
      } else {
        setExpandedVoucherId(voucher.voucherId);
      }
    },
    [expandedVoucherId]
  );

  const isExpired = (voucher: Voucher): boolean =>
    new Date(voucher.expiresAt) <= new Date();

  const isExpiringSoon = (voucher: Voucher): boolean => {
    const expiresAt = new Date(voucher.expiresAt);
    const now = new Date();
    const hoursLeft = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 24;
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-gray-900">
          {t('campaign.voucher_wallet')}
        </Text>
      </View>

      {activeVouchers.length === 0 && expiredVouchers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="ticket-outline" size={48} color="#D1D5DB" />
          <Text className="mt-4 text-center text-base text-gray-400">
            {t('campaign.voucher_empty')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 rounded-full bg-[#a1d973] px-6 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              {t('campaign.discover_campaigns')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.voucherId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="mb-2 mt-4 text-sm font-semibold text-gray-500">
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <VoucherCard
              voucher={item}
              isExpired={isExpired(item)}
              isExpiringSoon={isExpiringSoon(item)}
              isExpanded={expandedVoucherId === item.voucherId}
              onPress={() => handleVoucherPress(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};
