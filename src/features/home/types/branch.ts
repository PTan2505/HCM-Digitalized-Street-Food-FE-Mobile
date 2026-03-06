export interface ActiveBranch {
  branchId: number;
  vendorId: number;
  vendorName: string | null;
  userId: number;
  name: string;
  phoneNumber: string;
  email: string;
  addressDetail: string;
  ward: string;
  city: string;
  lat: number;
  long: number;
  createdAt: string;
  updatedAt: string | null;
  isVerified: boolean;
  avgRating: number;
  isActive: boolean;
}

export interface PaginatedBranches {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: ActiveBranch[];
}

export interface BranchImage {
  branchImageId: number;
  branchId: number;
  imageUrl: string;
}

export interface PaginatedBranchImages {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: BranchImage[];
}
