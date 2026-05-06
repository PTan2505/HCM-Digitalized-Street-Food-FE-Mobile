import type { VendorCampaignBranch } from '@features/customer/campaigns/types/generated';
import { PlaceCard } from '@features/customer/home/components/common/PlaceCard';
import { useWorkSchedule } from '@features/customer/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { computeDisplayName } from '@utils/computeDisplayName';
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

  const isMultiBranch = !!(
    branch.vendorName && branch.vendorName !== branch.name
  );
  const activeBranch = useMemo(() => toActiveBranch(branch), [branch]);
  const displayName = computeDisplayName(
    activeBranch,
    isMultiBranch,
    t('branch')
  );
  const { isOpen, isLoading } = useWorkSchedule(branch.branchId);
  const resolvedIsOpen = isLoading ? undefined : isOpen;

  return (
    <PlaceCard
      branch={activeBranch}
      displayName={displayName}
      imageUri={imageUri}
      isOpen={resolvedIsOpen}
      onPress={() =>
        navigation.navigate('RestaurantSwipe', {
          branch: activeBranch,
          displayName,
        })
      }
    />
  );
};
