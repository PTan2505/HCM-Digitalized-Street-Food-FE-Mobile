interface FieldError {
  field: string;
  errorType: string;
  message: string;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  fieldErrors?: FieldError[];
}

export interface APIErrorResponse {
  code?: string;
  status?: number;
  message?: string;
  fieldErrors?: FieldError[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}
