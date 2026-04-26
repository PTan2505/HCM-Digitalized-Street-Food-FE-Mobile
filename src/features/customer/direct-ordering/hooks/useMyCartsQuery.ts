import type { CartResponse } from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';

interface MyCartsResult {
  carts: CartResponse[];
  displayNames: Record<number, string>;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
}

async function fetchCartsWithDisplayNames(): Promise<{
  carts: CartResponse[];
  displayNames: Record<number, string>;
}> {
  const res = await axiosApi.cartApi.getMyCarts();
  const carts = res.data;

  const displayNames: Record<number, string> = {};
  await Promise.all(
    carts
      .filter(
        (c): c is CartResponse & { branchId: number } => c.branchId != null
      )
      .map(async (c) => {
        try {
          const branch = await axiosApi.branchApi.getBranchById(c.branchId);
          if (branch.vendorId != null) {
            const [vendor, vendorBranches] = await Promise.all([
              axiosApi.vendorApi.getVendorById(branch.vendorId),
              axiosApi.branchApi.getBranchesByVendor(branch.vendorId),
            ]);
            displayNames[c.branchId] =
              vendorBranches.totalCount > 1
                ? `${vendor.name} - ${t('branch')} ${branch.name}`
                : vendor.name;
          } else {
            displayNames[c.branchId] = branch.name;
          }
        } catch {
          displayNames[c.branchId] = c.branchName ?? '';
        }
      })
  );

  return { carts, displayNames };
}

export const useMyCartsQuery = (): MyCartsResult => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.cart.my,
    queryFn: fetchCartsWithDisplayNames,
    staleTime: 60 * 1000,
  });

  return {
    carts: data?.carts ?? [],
    displayNames: data?.displayNames ?? {},
    isLoading,
    refetch,
  };
};
