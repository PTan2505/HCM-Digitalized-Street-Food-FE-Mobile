interface BranchLike {
  vendorId?: number | null;
  vendorName?: string | null;
  name: string;
}

export const computeDisplayName = (
  branch: BranchLike,
  isMultiBranch: boolean,
  branchLabel: string
): string => {
  if (!branch.vendorId) return branch.name;
  const vendorName = branch.vendorName?.length
    ? branch.vendorName
    : branch.name;
  if (isMultiBranch) {
    return `${vendorName} - ${branchLabel} ${branch.name}`;
  }
  return vendorName;
};
