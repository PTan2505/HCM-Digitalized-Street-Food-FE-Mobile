import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { TicketVoucherCard } from '@features/campaigns/components/TicketVoucherCard';
import { useSystemCampaignBranches } from '@features/campaigns/hooks/useSystemCampaignBranches';
import type { VendorCampaignBranch } from '@features/campaigns/types/generated';
import { PlaceCard } from '@features/home/components/common/PlaceCard';
import SearchBar from '@features/home/components/common/SearchBar';
import type { ActiveBranch } from '@features/home/types/branch';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import { useAppSelector } from '@hooks/reduxHooks';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  computeDisplayName,
  selectIsMultiBranchVendor,
} from '@slices/branches';
import type { Voucher } from '@slices/campaigns';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type VoucherApplicableBranchesScreenProps = StaticScreenProps<{
  voucher: Voucher;
}>;

// ---------------------------------------------------------------------------
// Helper — adapt VendorCampaignBranch to ActiveBranch shape for PlaceCard
// ---------------------------------------------------------------------------
const toActiveBranch = (b: VendorCampaignBranch): ActiveBranch => ({
  branchId: b.branchId,
  vendorId: b.vendorId,
  vendorName: b.vendorName ?? b.name,
  managerId: b.managerId ?? 0,
  name: b.name,
  phoneNumber: b.phoneNumber,
  email: b.email,
  addressDetail: b.addressDetail,
  ward: b.ward,
  city: b.city,
  lat: b.lat,
  long: b.long,
  createdAt: b.createdAt,
  totalReviewCount: b.totalReviewCount,
  totalRatingSum: 0,
  dietaryPreferenceNames: [],
  updatedAt: b.updatedAt ?? null,
  isVerified: b.isVerified,
  avgRating: b.avgRating,
  isActive: b.isActive,
  isSubscribed: b.isSubscribed,
  tierId: b.tierId,
  tierName: b.tierName,
  finalScore: b.finalScore,
  distanceKm: b.distanceKm ?? null,
  dishes: [],
});

// ---------------------------------------------------------------------------
// Per-item component — owns Redux hooks so they aren't called inside renderItem
// ---------------------------------------------------------------------------
interface BranchItemProps {
  branch: VendorCampaignBranch;
  imageUri?: string;
}

const BranchItem = ({ branch, imageUri }: BranchItemProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const vendorNameFromRedux = useAppSelector(
    (state) =>
      state.branches.branches.find((b) => b.vendorId === branch.vendorId)
        ?.vendorName
  );
  const isMultiBranchFromRedux = useAppSelector((state) =>
    selectIsMultiBranchVendor(state, branch.vendorId)
  );

  const isMultiBranch =
    isMultiBranchFromRedux ||
    (!!branch.vendorName && branch.vendorName !== branch.name);

  const activeBranch = useMemo(() => toActiveBranch(branch), [branch]);

  const resolvedBranch = vendorNameFromRedux
    ? { ...activeBranch, vendorName: vendorNameFromRedux }
    : activeBranch;

  const displayName = computeDisplayName(
    resolvedBranch,
    isMultiBranch,
    t('branch')
  );

  return (
    <View className="mb-3">
      <PlaceCard
        branch={activeBranch}
        displayName={displayName}
        imageUri={imageUri}
        onPress={() =>
          navigation.navigate('RestaurantSwipe', {
            branch: activeBranch,
            displayName,
          })
        }
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Voucher → TicketVoucherCard helper — derives display props from Voucher
// ---------------------------------------------------------------------------
const getExpiresAt = (voucher: Voucher): Date =>
  new Date(voucher.expiredDate ?? voucher.endDate ?? '9999-12-31');

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
          expiresText={expiresAt.toLocaleDateString('vi-VN')}
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
        <>
          <View className="bg-gray-50">{ListHeader}</View>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </>
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
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BranchItem branch={item} imageUri={imageMap[item.branchId]} />
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
