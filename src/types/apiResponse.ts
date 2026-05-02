export interface BackendResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
  errorCode: string | null;
}

export interface ErrorResponse extends BackendResponse<unknown> {
  errorCode: string;
  retryAfter?: number;
}

export interface APIErrorResponse {
  code?: string;
  status?: number;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
