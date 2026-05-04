import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { useGhostPins } from '@customer/home/hooks/useGhostPins';
import type { ActiveBranch } from '@customer/home/types/branch';
import { Ionicons } from '@expo/vector-icons';
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

const GhostPinRow = ({
  branch,
  onPress,
}: {
  branch: ActiveBranch;
  onPress: () => void;
}): React.JSX.Element => {
  const { t } = useTranslation();
  const ratingLabel =
    branch.avgRating > 0
      ? `${branch.avgRating.toFixed(1)} ⭐`
      : t('vendor_ghost_pin.no_rating');

  return (
    <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-start justify-between">
        <Text
          className="flex-1 pr-2 text-base font-bold text-gray-900"
          numberOfLines={1}
        >
          {branch.name}
        </Text>
        <View
          className={`rounded-full border px-2 py-0.5 ${
            branch.isVerified
              ? 'border-green-200 bg-green-50'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              branch.isVerified ? 'text-green-700' : 'text-slate-600'
            }`}
          >
            {branch.isVerified
              ? t('vendor_ghost_pin.verified')
              : t('vendor_ghost_pin.unverified')}
          </Text>
        </View>
      </View>
      <Text className="text-xs text-gray-500" numberOfLines={2}>
        {[branch.addressDetail, branch.ward, branch.city]
          .filter(Boolean)
          .join(', ')}
      </Text>
      <Text className="mt-1 text-xs text-gray-400">{ratingLabel}</Text>

      <TouchableOpacity
        className="mt-3 flex-row items-center justify-center rounded-full bg-primary px-4 py-2"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="storefront-outline" size={14} color="white" />
        <Text className="ml-2 text-sm font-bold text-white">
          {t('vendor_ghost_pin.claim_button')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const VendorGhostPinScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const {
    branches,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useGhostPins();

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('vendor_ghost_pin.title')}
        onBackPress={() => navigation.goBack()}
      />
      {isLoading && branches.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : branches.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-gray-500">
            {t('vendor_ghost_pin.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => String(item.branchId)}
          renderItem={({ item }) => (
            <GhostPinRow
              branch={item}
              onPress={() =>
                navigation.navigate('VendorClaimBranch', {
                  branchId: item.branchId,
                  branchName: item.name,
                })
              }
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void refetch()}
          refreshing={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : null
          }
          ListHeaderComponent={
            <Text className="mb-3 text-sm text-gray-500">
              {t('vendor_ghost_pin.description')}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};
