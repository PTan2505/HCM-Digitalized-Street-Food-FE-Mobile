import { PlaceCard } from '@features/customer/home/components/common/PlaceCard';
import { useWorkSchedule } from '@features/customer/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { UserCoords } from '@features/customer/maps/hooks/useLocationPermission';
import type { JSX } from 'react';
import { View } from 'react-native';

interface HomeBranchCardProps {
  branch: ActiveBranch;
  displayName: string;
  imageUri?: string;
  userCoords?: UserCoords | null;
  onPress?: () => void;
}

export const HomeBranchCard = ({
  branch,
  displayName,
  imageUri,
  userCoords,
  onPress,
}: HomeBranchCardProps): JSX.Element => {
  const { isOpen, isLoading } = useWorkSchedule(branch.branchId);
  const resolved = isLoading ? undefined : isOpen;

  return (
    <View style={{ flex: 1, opacity: resolved === false ? 0.5 : 1 }}>
      <PlaceCard
        branch={branch}
        displayName={displayName}
        imageUri={imageUri}
        userCoords={userCoords}
        onPress={onPress}
        isOpen={resolved}
      />
    </View>
  );
};
