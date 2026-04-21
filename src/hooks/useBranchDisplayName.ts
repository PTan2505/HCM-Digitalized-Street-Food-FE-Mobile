import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@hooks/reduxHooks';
import {
  computeDisplayName,
  selectBranchById,
  selectIsMultiBranchVendor,
} from '@slices/branches';

interface BranchLike {
  vendorId: number | null;
  vendorName?: string | null;
  name: string;
}

/**
 * Hook to get the display name for a branch.
 * Handles i18n and multi-branch vendor logic automatically.
 *
 * @param branchId - The branch ID to get display name for
 * @returns The computed display name or undefined if branch not found
 */
export const useBranchDisplayName = (branchId: number): string | undefined => {
  const { t } = useTranslation();
  const branch = useAppSelector((state) => selectBranchById(state, branchId));
  const isMultiBranch = useAppSelector((state) =>
    branch ? selectIsMultiBranchVendor(state, branch.vendorId) : false
  );

  if (!branch) return undefined;

  return computeDisplayName(branch, isMultiBranch, t('branch'));
};

/**
 * Hook to get the display name for a branch object.
 * Use this when you already have the branch data.
 *
 * @param branch - The branch object (must have vendorId, vendorName, name)
 * @returns The computed display name
 */
export const useBranchDisplayNameFromBranch = (branch: BranchLike): string => {
  const { t } = useTranslation();
  const isMultiBranch = useAppSelector((state) =>
    selectIsMultiBranchVendor(state, branch.vendorId)
  );

  return computeDisplayName(
    branch as Parameters<typeof computeDisplayName>[0],
    isMultiBranch,
    t('branch')
  );
};
