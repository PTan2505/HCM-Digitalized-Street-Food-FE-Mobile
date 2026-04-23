import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface VendorDish {
  dishId: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isSoldOut: boolean;
  isActive: boolean;
  categoryName?: string;
  tasteNames: string[];
  dietaryPreferenceNames?: string[];
}

export interface PaginatedVendorDishes {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: VendorDish[];
}

export interface AssignDishesRequest {
  dishIds: number[];
}

export class ManagerDishApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getVendorDishes(
    vendorId: number,
    params: { pageNumber: number; pageSize: number; keyword?: string }
  ): Promise<PaginatedVendorDishes> {
    const res = await this.apiClient.get<PaginatedVendorDishes>({
      url: apiUrl.dish.byVendor(vendorId),
      params,
    });
    return res.data;
  }

  async getBranchDishes(
    branchId: number,
    params: { pageNumber: number; pageSize: number }
  ): Promise<PaginatedVendorDishes> {
    const res = await this.apiClient.get<PaginatedVendorDishes>({
      url: apiUrl.dish.byBranch(branchId),
      params,
    });
    return res.data;
  }

  async assignDishes(branchId: number, dishIds: number[]): Promise<void> {
    await this.apiClient.post<void, AssignDishesRequest>({
      url: apiUrl.dish.byBranch(branchId),
      data: { dishIds },
    });
  }

  async unassignDishes(branchId: number, dishIds: number[]): Promise<void> {
    await this.apiClient.deleteWithBody<void, AssignDishesRequest>({
      url: apiUrl.dish.byBranch(branchId),
      data: { dishIds },
    });
  }

  async updateDishAvailability(
    dishId: number,
    branchId: number,
    isSoldOut: boolean
  ): Promise<void> {
    await this.apiClient.patch<void, { isSoldOut: boolean }>({
      url: apiUrl.dish.availability(dishId, branchId),
      data: { isSoldOut },
    });
  }
}
