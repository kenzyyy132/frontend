

export interface ApiSuccess<T> {
  status: 'success';
  message?: string;
  data: T;
}


export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiListResponse<T> extends ApiSuccess<T[]> {
  results: number;
  pagination: ApiPagination;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  status: 'error';
  message: string;
  errors?: ApiFieldError[];
}


export interface PagedResult<T> {
  items: T[];
  pagination: ApiPagination;
}
