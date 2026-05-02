import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useMyCartsQuery } from '@features/customer/direct-ordering/hooks/useMyCartsQuery';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const MyCartsScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const {
    carts,
    displayNames: cartsDisplayNames,
    isLoading: cartsLoading,
  } = useMyCartsQuery();

  const [isNavigating, setIsNavigating] = useState(false);
  const queryClient = useQueryClient();

  const cartsWithItems = carts.filter((c) => c.items.length > 0);

  const handleCartPress = useCallback(
    async (branchId: number) => {
      try {
        setIsNavigating(true);
        const [detail, dishesList] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: queryKeys.branches.detail(branchId),
            queryFn: () => axiosApi.branchApi.getBranchById(branchId),
            staleTime: 5 * 60 * 1000,
          }),
          queryClient.fetchQuery({
            queryKey: queryKeys.dishes.byBranch(branchId),
            queryFn: async () => {
              const res = await axiosApi.branchApi.getDishesByBranch(branchId, {
                pageNumber: 1,
                pageSize: 100,
              });
              return res.items ?? [];
            },
            staleTime: 5 * 60 * 1000,
          }),
        ]);

        let vendorName: string | null = null;
        let displayName: string = detail.name;

        if (detail.vendorId != null) {
          const vendorId = detail.vendorId;
          const [vendor, vendorBranches] = await Promise.all([
            queryClient.fetchQuery({
              queryKey: ['vendors', 'detail', vendorId],
              queryFn: () => axiosApi.vendorApi.getVendorById(vendorId),
              staleTime: 5 * 60 * 1000,
            }),
            queryClient.fetchQuery({
              queryKey: queryKeys.managerBranch.all,
              queryFn: () => axiosApi.branchApi.getBranchesByVendor(vendorId),
              staleTime: 5 * 60 * 1000,
            }),
          ]);
          vendorName = vendor.name;
          displayName =
            vendorBranches.totalCount > 1
              ? `${vendor.name} - ${t('branch')} ${detail.name}`
              : vendor.name;
        }

        const branch: ActiveBranch = {
          branchId: detail.branchId,
          vendorId: detail.vendorId,
          vendorName,
          managerId: detail.managerId,
          name: detail.name,
          phoneNumber: detail.phoneNumber,
          email: detail.email,
          addressDetail: detail.addressDetail,
          ward: detail.ward,
          city: detail.city,
          lat: detail.lat,
          long: detail.long,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
          isVerified: detail.isVerified,
          avgRating: detail.avgRating,
          totalReviewCount: detail.totalReviewCount,
          totalRatingSum: 0,
          isActive: detail.isActive,
          isSubscribed: detail.isSubscribed,
          tierId: detail.tierId,
          tierName: detail.tierName ?? '',
          dietaryPreferenceNames: [],
          finalScore: 0,
          distanceKm: null,
          dishes: dishesList,
        };

        navigation.navigate('RestaurantDetails', {
          branch,
          displayName,
          tab: 'menu',
        });
      } catch {
        Alert.alert(t('error'), t('cart.failed_to_load_branch'));
      } finally {
        setIsNavigating(false);
      }
    },
    [navigation, t, queryClient]
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('cart.my_carts')}
        onBackPress={() => navigation.goBack()}
      />

      {isNavigating && (
        <View className="absolute bottom-0 left-0 right-0 top-0 z-50 items-center justify-center bg-white/50">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {cartsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : cartsWithItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text className="mt-4 text-lg font-semibold text-gray-400">
            {t('cart.my_carts_empty')}
          </Text>
          <Text className="mt-1 text-center text-base text-gray-300">
            {t('cart.my_carts_empty_hint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={cartsWithItems}
          keyExtractor={(item) => String(item.cartId)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => {
            const itemCount = item.items.reduce(
              (sum, i) => sum + i.quantity,
              0
            );
            const totalFormatted = `${item.totalAmount.toLocaleString('vi-VN')}đ`;

            return (
              <TouchableOpacity
                onPress={() =>
                  item.branchId != null && handleCartPress(item.branchId)
                }
                className="mx-4 mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Info */}
                <View className="flex-1">
                  <Text
                    className="text-base font-bold text-black"
                    numberOfLines={1}
                  >
                    {(item.branchId != null
                      ? (cartsDisplayNames[item.branchId] ?? item.branchName)
                      : item.branchName) ?? '—'}
                  </Text>
                  <Text className="mt-0.5 text-sm text-gray-500">
                    {t('cart.n_items_total', {
                      count: itemCount,
                      total: totalFormatted,
                    })}
                  </Text>
                </View>

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#bbb" />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};
