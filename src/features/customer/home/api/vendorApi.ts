import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type {
  PaginatedVendors,
  Vendor,
} from '@features/customer/home/types/vendor';

export class VendorApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVendorById(vendorId: number): Promise<Vendor> {
    const res = await this.apiClient.get<Vendor>({
      url: apiUrl.vendor.byId(vendorId),
    });
    return res.data;
  }

  async getVendors(page = 1, pageSize = 10): Promise<PaginatedVendors> {
    const res = await this.apiClient.get<PaginatedVendors>({
      url: apiUrl.vendor.getAll,
      params: { pageNumber: page, pageSize },
    });
    return res.data;
  }
}
