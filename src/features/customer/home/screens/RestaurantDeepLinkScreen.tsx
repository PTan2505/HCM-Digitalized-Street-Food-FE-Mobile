import type { TabType } from '@features/customer/home/screens/RestaurantDetailsScreen';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

type Props = StaticScreenProps<{ branchId: number; tab?: TabType }>;

export const RestaurantDeepLinkScreen = ({ route }: Props): JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { branchId, tab } = route.params;
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
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
        let displayName: string;

        if (detail.vendorId != null) {
          const vendorId = detail.vendorId;
          const [vendor, vendorBranches] = await Promise.all([
            queryClient.fetchQuery({
              queryKey: ['vendors', 'detail', vendorId],
              queryFn: () => axiosApi.vendorApi.getVendorById(vendorId),
              staleTime: 5 * 60 * 1000,
            }),
            queryClient.fetchQuery({
              queryKey: queryKeys.managerBranch.all, // Using a generic key, or bypass cache
              queryFn: () => axiosApi.branchApi.getBranchesByVendor(vendorId),
              staleTime: 5 * 60 * 1000,
            }),
          ]);
          vendorName = vendor.name;
          displayName =
            vendorBranches.totalCount > 1
              ? `${vendor.name} - ${t('branch')} ${detail.name}`
              : vendor.name;
        } else {
          displayName = detail.name;
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

        navigation.replace('RestaurantDetails', { branch, displayName, tab });
      } catch {
        setError(true);
      }
    };

    load();
  }, [branchId, navigation, t, tab, queryClient]);

  if (error) {
    navigation.goBack();
    return <View />;
  }

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
};
