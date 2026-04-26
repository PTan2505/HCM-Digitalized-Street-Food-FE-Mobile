import {
  PlaceCard,
  type VoucherChip,
} from '@features/customer/home/components/common/PlaceCard';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { UserCoords } from '@features/customer/maps/hooks/useLocationPermission';
import { computeDisplayName } from '@utils/computeDisplayName';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { registerCallback } from '@utils/callbackRegistry';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface VendorCampaignPlaceCardProps {
  branch: ActiveBranch;
  imageUri?: string;
  userCoords?: UserCoords | null;
  vouchers?: VoucherChip[];
  isMultiBranch?: boolean;
  onRatingUpdate: (avgRating: number, totalReviewCount: number) => void;
}

export const VendorCampaignPlaceCard = ({
  branch,
  imageUri,
  userCoords,
  vouchers,
  isMultiBranch: isMultiBranchProp,
  onRatingUpdate,
}: VendorCampaignPlaceCardProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  // Primary: look up by branchId in Redux (has real vendorName if branch is in active list)
  const isMultiBranch =
    isMultiBranchProp ??
    !!(branch.vendorName && branch.vendorName !== branch.name);

  const displayName = computeDisplayName(branch, isMultiBranch, t('branch'));

  return (
    <PlaceCard
      branch={branch}
      displayName={displayName}
      imageUri={imageUri}
      userCoords={userCoords}
      vouchers={vouchers}
      onPress={() =>
        navigation.navigate('RestaurantDetails', {
          branch,
          displayName,
          onRatingUpdateId: registerCallback(onRatingUpdate),
        })
      }
    />
  );
};
