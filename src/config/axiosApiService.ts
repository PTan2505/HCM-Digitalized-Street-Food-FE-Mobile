import { apiUrl } from '@lib/api/apiUrl';
import { tokenManagement } from '@utils/tokenManagement';
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

const skipAuthorizationPaths = [apiUrl.auth.googleLogin, apiUrl.auth.login];
export interface ApiService {
  // TODO: Standardize the error response
  call<TResponse = unknown, TRequest = unknown>(
    requestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>>;
  isApiError(error: unknown): boolean;
}

/** Serialize params with repeated keys for arrays: DietaryIds=1&DietaryIds=2 */
const serializeParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
    } else {
      searchParams.append(key, String(value as string | number | boolean));
    }
  }
  return searchParams.toString();
};

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  paramsSerializer: serializeParams,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const isSkipAuthorization = skipAuthorizationPaths.some((path) =>
      config.url?.includes(path)
    );

    const accessToken = await tokenManagement.getAccessToken();

    if (config.headers && accessToken && !isSkipAuthorization) {
      (config.headers as AxiosHeaders).set(
        'Authorization',
        `Bearer ${accessToken}`
      );
    }

    return config;
  },
  (error) => {
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error(String(error)));
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig;

    const isAuthEndpoint =
      !!originalRequest.url &&
      skipAuthorizationPaths.some((path) =>
        originalRequest.url?.includes(path)
      );

    // No refresh-token flow in mobile currently; on 401 we clear tokens so the app
    // can take the user back to login via UI/navigation.
    if (error.response?.status === 401 && !isAuthEndpoint) {
      await tokenManagement.clearTokens();
    }

    return Promise.reject(error);
  }
);

export class AxiosApiService implements ApiService {
  private axios = axiosInstance;

  async call<TResponse, TRequest>(
    axiosRequestConfig: AxiosRequestConfig<TRequest>
  ): Promise<AxiosResponse<TResponse>> {
    const res = await this.axios.request(axiosRequestConfig);
    return res;
  }

  isApiError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return true;
    }
    return false;
  }
}
