import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import type { ManagerBranch } from '@manager/branch/branch.types';
import { BranchStatusBadge } from '@manager/vendor-branches/components/BranchStatusBadge';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BranchRow = ({
  branch,
  onPress,
}: {
  branch: ManagerBranch;
  onPress: () => void;
}): React.JSX.Element => (
  <TouchableOpacity
    onPress={onPress}
    className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
    activeOpacity={0.7}
  >
    <View className="mb-2 flex-row items-start justify-between">
      <Text
        className="flex-1 pr-2 text-base font-bold text-gray-900"
        numberOfLines={1}
      >
        {branch.name}
      </Text>
      <BranchStatusBadge
        isActive={branch.isActive}
        isVerified={branch.isVerified}
      />
    </View>
    <Text className="text-xs text-gray-500" numberOfLines={2}>
      {[branch.addressDetail, branch.ward, branch.city]
        .filter(Boolean)
        .join(', ')}
    </Text>
    {branch.avgRating != null && (
      <Text className="mt-1 text-xs text-gray-400">
        ★ {branch.avgRating.toFixed(1)} · {branch.totalReviewCount ?? 0} đánh
        giá
      </Text>
    )}
  </TouchableOpacity>
);

export const VendorBranchListScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { data: vendorInfo, isLoading, isError, refetch } = useVendorInfo();

  const branches = vendorInfo?.branches ?? [];
  const vendorId = vendorInfo?.vendorId;
  const hasBranches = branches.length > 0;

  const handleCreateOrAdd = (): void => {
    if (!hasBranches || vendorId === undefined) {
      navigation.navigate('VendorCreateBranch', { mode: 'createVendor' });
    } else {
      navigation.navigate('VendorCreateBranch', {
        mode: 'addBranch',
        vendorId,
      });
    }
  };

  const ctaLabel = hasBranches
    ? t('vendor_branches.add_branch_cta')
    : t('vendor_branches.create_vendor_cta');

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('vendor_branches.title')}
        secondaryAction={{
          icon: <Ionicons name="add" size={20} color={COLORS.primary} />,
          onPress: handleCreateOrAdd,
        }}
      />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('vendor_branches.error_load')}
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-6 py-2"
            onPress={() => void refetch()}
          >
            <Text className="font-semibold text-white">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : !hasBranches ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('vendor_branches.empty')}
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-full bg-primary px-6 py-3"
            onPress={handleCreateOrAdd}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="font-semibold text-white">{ctaLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => String(item.branchId)}
          renderItem={({ item }) => (
            <BranchRow
              branch={item}
              onPress={() =>
                navigation.navigate('VendorBranchDetail', {
                  branchId: item.branchId,
                })
              }
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void refetch()}
          refreshing={false}
        />
      )}
    </SafeAreaView>
  );
};
