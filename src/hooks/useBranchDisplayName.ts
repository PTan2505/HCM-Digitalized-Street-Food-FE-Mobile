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
  const { data: branch } = useQuery({
    queryKey: queryKeys.branches.detail(branchId),
    queryFn: () => axiosApi.branchApi.getBranchById(branchId),
    staleTime: 5 * 60 * 1000,
    enabled: branchId > 0,
  });

  if (!branch) return undefined;

  // BranchDetail has no vendorName — return the branch name directly.
  return branch.name;
};

export const useBranchDisplayNameFromBranch = (branch: BranchLike): string => {
  const { t } = useTranslation();
  const isMultiBranch = !!(
    branch.vendorName && branch.vendorName !== branch.name
  );
  return computeDisplayName(branch, isMultiBranch, t('branch'));
};
