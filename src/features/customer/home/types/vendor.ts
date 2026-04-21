export interface Branch {
  branchId: number;
  vendorId: number;
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
  isSubscribed: boolean;
  licenseUrls: string[];
  licenseStatus: string | null;
  licenseRejectReason: string | null;
}

export interface Vendor {
  vendorId: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  vendorOwnerName: string;
  branches: Branch[];
}

export interface PaginatedVendors {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Vendor[];
}
