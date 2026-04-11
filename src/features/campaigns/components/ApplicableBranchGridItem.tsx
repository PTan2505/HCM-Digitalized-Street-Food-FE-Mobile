import type { VendorCampaignBranch } from '@features/campaigns/types/generated';
import { PlaceCard } from '@features/home/components/common/PlaceCard';
import type { ActiveBranch } from '@features/home/types/branch';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  computeDisplayName,
  selectIsMultiBranchVendor,
} from '@slices/branches';
import type { JSX } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const toActiveBranch = (branch: VendorCampaignBranch): ActiveBranch => ({
  branchId: branch.branchId,
  vendorId: branch.vendorId,
  vendorName: branch.vendorName ?? branch.name,
  managerId: branch.managerId ?? 0,
  name: branch.name,
  phoneNumber: branch.phoneNumber,
  email: branch.email,
  addressDetail: branch.addressDetail,
  ward: branch.ward,
  city: branch.city,
  lat: branch.lat,
  long: branch.long,
  createdAt: branch.createdAt,
  totalReviewCount: branch.totalReviewCount,
  totalRatingSum: 0,
  dietaryPreferenceNames: [],
  updatedAt: branch.updatedAt ?? null,
  isVerified: branch.isVerified,
  avgRating: branch.avgRating,
  isActive: branch.isActive,
  isSubscribed: branch.isSubscribed,
  tierId: branch.tierId,
  tierName: branch.tierName,
  finalScore: branch.finalScore,
  distanceKm: branch.distanceKm ?? null,
  dishes: [],
});

interface ApplicableBranchGridItemProps {
  branch: VendorCampaignBranch;
  imageUri?: string;
}

export const ApplicableBranchGridItem = ({
  branch,
  imageUri,
}: ApplicableBranchGridItemProps): JSX.Element => {
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
  );
};
