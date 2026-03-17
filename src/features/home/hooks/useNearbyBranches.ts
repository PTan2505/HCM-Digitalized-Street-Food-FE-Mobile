import type { ActiveBranch } from '@features/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { useEffect, useState } from 'react';

export const useNearbyBranches = (
  lat: number,
  lng: number,
  excludeBranchId: number
): { branches: ActiveBranch[]; isLoading: boolean } => {
  const [branches, setBranches] = useState<ActiveBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;

    let cancelled = false;
    setIsLoading(true);

    axiosApi.stallSearchApi
      .searchStalls({ Lat: lat, Long: lng, Distance: 2, pageSize: 6 })
      .then((data) => {
        if (!cancelled) {
          setBranches(data.items.filter((b) => b.branchId !== excludeBranchId));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return (): void => {
      cancelled = true;
    };
  }, [lat, lng, excludeBranchId]);

  return { branches, isLoading };
};
