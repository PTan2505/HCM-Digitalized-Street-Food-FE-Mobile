import {
  PlaceCard,
  type VoucherChip,
} from '@features/home/components/common/PlaceCard';
import type { ActiveBranch } from '@features/home/types/branch';
import type { UserCoords } from '@features/maps/hooks/useLocationPermission';
import { useAppSelector } from '@hooks/reduxHooks';
import { useBranchDisplayName } from '@hooks/useBranchDisplayName';
import {
  computeDisplayName,
  selectIsMultiBranchVendor,
} from '@slices/branches';
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
  const displayNameFromId = useBranchDisplayName(branch.branchId);

  // Fallback: find vendorName by vendorId from any Redux branch of the same vendor
  const vendorNameFromRedux = useAppSelector(
    (state) =>
      state.branches.branches.find((b) => b.vendorId === branch.vendorId)
        ?.vendorName
  );
  const isMultiBranchFromRedux = useAppSelector((state) =>
    selectIsMultiBranchVendor(state, branch.vendorId)
  );
  const isMultiBranch = isMultiBranchProp ?? isMultiBranchFromRedux;

  const displayName =
    displayNameFromId ??
    computeDisplayName(
      { ...branch, vendorName: vendorNameFromRedux ?? branch.vendorName },
      isMultiBranch,
      t('branch')
    );

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
