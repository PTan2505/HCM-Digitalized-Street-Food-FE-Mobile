import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

import type { Category } from '@features/customer/home/types/category';

export class CategoryApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getCategories(): Promise<Category[]> {
    const res = await this.apiClient.get<Category[]>({
      url: apiUrl.category.getAll,
    });
    return res.data;
  }
}
