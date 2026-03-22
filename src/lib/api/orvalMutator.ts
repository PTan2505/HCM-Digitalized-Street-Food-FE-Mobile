/**
 * Custom Axios mutator for Orval-generated API clients.
 *
 * Uses the same authenticated Axios instance as the rest of the app so that:
 * - Bearer token injection via request interceptor is applied automatically.
 * - 401 token-clearing logic (no refresh flow) is applied automatically.
 *
 * The backend wraps all responses in:
 *   { status, message, data: T, errorCode }
 *
 * This mutator unwraps the envelope so Orval-generated functions return
 * `Promise<T>` rather than `Promise<BackendResponse<T>>`.
 */

import type { BackendResponse } from '@custom-types/apiResponse';
import { axiosInstance } from '@config/axiosApiService';
import type { AxiosRequestConfig } from 'axios';

export const orvalMutator = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance
    .request<BackendResponse<T>>(config)
    .then((res) => res.data.data);
};

export default orvalMutator;
