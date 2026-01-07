import type { ApiService } from '@config/axiosApiService';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export default class ApiClient {
  private service: ApiService;

  constructor(service: ApiService) {
    this.service = service;
  }

  private async handleRequest<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>> {
    const res = await this.service.call<TResponse>({
      ...requestConfig,
    });
    return res;
  }

  get<TResponse>(
    requestConfig: AxiosRequestConfig<null>
  ): Promise<AxiosResponse<TResponse>> {
    return this.handleRequest<TResponse, null>({
      ...requestConfig,
      method: 'GET',
    });
  }

  post<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>> {
    return this.handleRequest<TResponse, TRequest>({
      ...requestConfig,
      method: 'POST',
    });
  }

  put<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>> {
    return this.handleRequest<TResponse, TRequest>({
      ...requestConfig,
      method: 'PUT',
    });
  }

  patch<TResponse, TRequest>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>> {
    return this.handleRequest<TResponse, TRequest>({
      ...requestConfig,
      method: 'PATCH',
    });
  }

  delete<TResponse>(
    requestConfig: AxiosRequestConfig<null>
  ): Promise<AxiosResponse<TResponse>> {
    return this.handleRequest<TResponse, null>({
      ...requestConfig,
      method: 'DELETE',
    });
  }
}
