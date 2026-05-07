import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { computeDisplayName } from '@utils/computeDisplayName';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface BranchLike {
  vendorId: number | null;
  vendorName?: string | null;
  name: string;
}

export const useBranchDisplayName = (branchId: number): string | undefined => {
  const { t } = useTranslation();

  const { data: branch } = useQuery({
    queryKey: queryKeys.branches.detail(branchId),
    queryFn: () => axiosApi.branchApi.getBranchById(branchId),
    staleTime: 5 * 60 * 1000,
    enabled: branchId > 0,
  });

  const vendorId = branch?.vendorId ?? null;

  const { data: vendor } = useQuery({
    queryKey: ['vendors', 'detail', vendorId],
    queryFn: () => axiosApi.vendorApi.getVendorById(vendorId as number),
    staleTime: 5 * 60 * 1000,
    enabled: vendorId != null,
  });

  const { data: vendorBranches } = useQuery({
    queryKey: ['branches', 'byVendor', vendorId],
    queryFn: () => axiosApi.branchApi.getBranchesByVendor(vendorId as number),
    staleTime: 5 * 60 * 1000,
    enabled: vendorId != null,
  });

  if (!branch) return undefined;
  if (vendorId == null) return branch.name;
  if (!vendor || !vendorBranches) return undefined;

  return computeDisplayName(
    { vendorId, vendorName: vendor.name, name: branch.name },
    vendorBranches.totalCount > 1,
    t('branch')
  );
};

export const useBranchDisplayNameFromBranch = (branch: BranchLike): string => {
  const { t } = useTranslation();
  const isMultiBranch = !!(
    branch.vendorName && branch.vendorName !== branch.name
  );
  return computeDisplayName(branch, isMultiBranch, t('branch'));
};
