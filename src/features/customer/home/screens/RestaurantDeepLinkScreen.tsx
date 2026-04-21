import type { TabType } from '@features/customer/home/screens/RestaurantDetailsScreen';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

  useEffect(() => {
    axiosApi.branchApi
      .getBranchById(branchId)
      .then((detail) =>
        Promise.all([
          axiosApi.vendorApi.getVendorById(detail.vendorId),
          axiosApi.branchApi.getBranchesByVendor(detail.vendorId),
          axiosApi.branchApi.getDishesByBranch(branchId, { pageSize: 100 }),
          Promise.resolve(detail),
        ])
      )
      .then(([vendor, vendorBranches, paginatedDishes, detail]) => {
        const isMultiBranch = vendorBranches.totalCount > 1;
        const displayName = isMultiBranch
          ? `${vendor.name} - ${t('branch')} ${detail.name}`
          : vendor.name;

        const branch: ActiveBranch = {
          branchId: detail.branchId,
          vendorId: detail.vendorId,
          vendorName: vendor.name,
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
          dishes: paginatedDishes.items,
        };

        navigation.replace('RestaurantDetails', { branch, displayName, tab });
      })
      .catch(() => setError(true));
  }, [branchId, navigation, t, tab]);

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
