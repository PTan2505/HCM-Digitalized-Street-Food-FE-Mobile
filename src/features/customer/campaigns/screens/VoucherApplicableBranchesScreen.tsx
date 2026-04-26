import SearchBar from '@components/SearchBar';
import { getExpiresAt } from '@customer/campaigns/utils/voucher';
import { useLocationPermission } from '@customer/maps/hooks/useLocationPermission';
import { Ionicons } from '@expo/vector-icons';
import { ApplicableBranchGridItem } from '@features/customer/campaigns/components/ApplicableBranchGridItem';
import { TicketVoucherCard } from '@features/customer/campaigns/components/TicketVoucherCard';
import { useSystemCampaignBranches } from '@features/customer/campaigns/hooks/useSystemCampaignBranches';
import { PlaceCardSkeleton } from '@features/customer/home/components/common/HomeSkeleton';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { Voucher } from '@features/customer/campaigns/types/voucher';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type VoucherApplicableBranchesScreenProps = StaticScreenProps<{
  voucher: Voucher;
}>;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export const VoucherApplicableBranchesScreen = ({
  route,
}: VoucherApplicableBranchesScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { voucher } = route.params;
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');

  const { coords } = useLocationPermission();

  const { branches, imageMap, isLoading, isError, refetch } =
    useSystemCampaignBranches(voucher.campaignId, coords);

  const skeletonItems = Array.from({ length: 6 }, (_, i) => ({
    _skeleton: true as const,
    id: i,
  }));

  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return branches;
    const q = searchQuery.trim().toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.addressDetail.toLowerCase().includes(q) ||
        (b.vendorName ?? '').toLowerCase().includes(q)
    );
  }, [branches, searchQuery]);

  const discountText = voucher.voucherType.toUpperCase().includes('PERCENT')
    ? `${voucher.discountValue}%`
    : `${voucher.discountValue.toLocaleString('vi-VN')}đ`;

  const expiresAt = getExpiresAt(voucher);

  const ListHeader = (
    <View>
      {/* Voucher card */}
      <View className="px-4 pt-4">
        <TicketVoucherCard
          discountText={discountText}
          title={voucher.voucherName}
          subtitle={
            voucher.maxDiscountValue != null
              ? t('voucher_wallet.max_discount', {
                  amount: voucher.maxDiscountValue.toLocaleString('vi-VN'),
                })
              : undefined
          }
          expiresText={
            expiresAt?.toLocaleDateString('vi-VN') ??
            t('voucher_wallet.no_expiry')
          }
          secondaryMetaText={t('voucher_wallet.voucher_active')}
          secondaryMetaIcon="checkmark-circle-outline"
          tertiaryMetaText={
            voucher.minAmountRequired != null
              ? t('voucher_wallet.min_order', {
                  amount: voucher.minAmountRequired.toLocaleString('vi-VN'),
                })
              : undefined
          }
        />
      </View>

      {/* Section label */}
      <View className="px-4 pb-3 pt-2">
        <Text className="text-center text-base font-semibold text-gray-700">
          {t('voucher_wallet.applicable_branches_title')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      {/* Search bar row with back button */}
      <View
        className="flex-row items-center bg-white px-2 py-2 shadow-sm"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-1 p-2"
        >
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <View className="flex-1">
          <SearchBar
            noMargin
            placeholder={t(
              'voucher_wallet.applicable_branches_search_placeholder'
            )}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <FlatList
          data={skeletonItems}
          keyExtractor={(item) => `skeleton-${item.id}`}
          numColumns={2}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
          renderItem={() => (
            <View className="w-[49%]">
              <PlaceCardSkeleton />
            </View>
          )}
        />
      ) : isError ? (
        <>
          <View className="bg-gray-50">{ListHeader}</View>
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
            <Text className="mt-3 text-center text-base text-gray-400">
              {t('voucher_wallet.applicable_branches_error')}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-4 rounded-full bg-primary px-6 py-2.5"
            >
              <Text className="text-base font-semibold text-white">
                {t('voucher_wallet.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <FlatList
          data={filteredBranches}
          keyExtractor={(item) => String(item.branchId)}
          numColumns={2}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
          renderItem={({ item }) => (
            <View className="w-[49%]">
              <ApplicableBranchGridItem
                branch={item}
                imageUri={imageMap[item.branchId]}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center px-6 py-12">
              <Ionicons name="storefront-outline" size={48} color="#D1D5DB" />
              <Text className="mt-3 text-center text-base text-gray-400">
                {t('voucher_wallet.applicable_branches_empty')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};
