interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  errorCode: string;
  status: number;
  title: string;
  error?: FieldError[];
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
