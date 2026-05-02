import type { Tier } from '@features/customer/home/api/tierApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { VendorTier } from '@custom-types/vendor';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export const useTiers = (): {
  tiers: Tier[];
  tierById: (tierId: number) => VendorTier | undefined;
} => {
  const { data: tiers = [] } = useQuery({
    queryKey: queryKeys.tiers.all,
    queryFn: () => axiosApi.tierApi.getTiers(),
    staleTime: Infinity,
  });

  const tierById = useCallback(
    (tierId: number): VendorTier | undefined => {
      const tier = tiers.find((t) => t.tierId === tierId);
      if (!tier) return undefined;
      const lower = tier.name.toLowerCase();
      if (
        lower === 'diamond' ||
        lower === 'gold' ||
        lower === 'silver' ||
        lower === 'warning'
      ) {
        return lower as VendorTier;
      }
      return undefined;
    },
    [tiers]
  );

  return { tiers, tierById };
};
