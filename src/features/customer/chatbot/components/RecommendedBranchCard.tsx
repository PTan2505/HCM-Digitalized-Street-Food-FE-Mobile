import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';

import type { RecommendedBranch } from '@features/customer/chatbot/types/chatbot';
import { mapRecommendedBranchToActiveBranch } from '@features/customer/chatbot/utils/mapRecommendedBranch';
import SearchResultCard from '@features/customer/home/components/common/SearchResultCard';
import { useBranchDishes } from '@features/customer/home/hooks/useBranchDishes';
import { useBranchImages } from '@features/customer/home/hooks/useBranchImages';
import { useBranchDisplayNameFromBranch } from '@hooks/useBranchDisplayName';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

type Props = {
  branch: RecommendedBranch;
};

export const RecommendedBranchCard = ({ branch }: Props): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  const { imageUrls } = useBranchImages(branch.branchId);
  const { dishes: fetchedDishes } = useBranchDishes(branch.branchId);
  const { data: branchDetail } = useQuery({
    queryKey: queryKeys.branches.detail(branch.branchId),
    queryFn: () => axiosApi.branchApi.getBranchById(branch.branchId),
    staleTime: 5 * 60 * 1000,
  });

  const imageUri = imageUrls[0];

  const baseBranch = mapRecommendedBranchToActiveBranch(branch);

  const recommendedIds = new Set(branch.recommendedDishes.map((d) => d.dishId));
  const dishes =
    fetchedDishes.length > 0
      ? [...fetchedDishes].sort(
          (a, b) =>
            (recommendedIds.has(a.dishId) ? 0 : 1) -
            (recommendedIds.has(b.dishId) ? 0 : 1)
        )
      : baseBranch.dishes;

  const activeBranch = {
    ...baseBranch,
    dishes,
    totalReviewCount:
      branchDetail?.totalReviewCount ?? baseBranch.totalReviewCount,
    avgRating: branchDetail?.avgRating ?? baseBranch.avgRating,
  };
  const displayName = useBranchDisplayNameFromBranch(branch);

  const handlePress = (): void => {
    navigation.navigate('RestaurantDetails', {
      branch: activeBranch,
      displayName,
    });
  };

  return (
    <View style={{ width: 300 }}>
      <SearchResultCard
        branch={activeBranch}
        imageUri={imageUri}
        displayName={displayName}
        onPress={handlePress}
      />
    </View>
  );
};
