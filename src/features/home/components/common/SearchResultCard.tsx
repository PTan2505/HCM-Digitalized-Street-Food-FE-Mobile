import type { JSX } from 'react';
import { useWorkSchedule } from '@features/home/hooks/useWorkSchedule';
import type { ActiveBranch } from '@features/home/types/branch';
import CurrentPickCard from './CurrentPickCard';

interface SearchResultCardProps {
  branch: ActiveBranch;
  onPress?: () => void;
}

const SearchResultCard = ({
  branch,
  onPress,
}: SearchResultCardProps): JSX.Element => {
  const { isLoading, isOpen } = useWorkSchedule(
    branch.isActive ? branch.branchId : null
  );

  const openStatus = isLoading
    ? undefined
    : isOpen
      ? 'open'
      : 'closed';

  return (
    <CurrentPickCard
      id={String(branch.branchId)}
      name={branch.name}
      rating={branch.avgRating}
      distance={
        branch.distanceKm != null
          ? `${branch.distanceKm.toFixed(1)} km`
          : '-'
      }
      priceRange={
        branch.dishes[0]?.price != null
          ? `${branch.dishes[0].price.toLocaleString('vi-VN')}đ`
          : ''
      }
      tag={branch.dishes[0]?.name ?? branch.ward}
      image={{ uri: branch.dishes[0]?.imageUrl ?? '' }}
      likes={0}
      comments={0}
      isTopPick={false}
      openStatus={openStatus as 'open' | 'closed' | undefined}
      onPress={onPress}
    />
  );
};

export default SearchResultCard;
