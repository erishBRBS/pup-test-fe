export interface Role {
  id: number;
  roleName: string;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role?: Role;
  roleName?: string;
  status: boolean;
  lastActivityAt?: string | null;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  message?: string;
  success?: boolean;
  data: T;
  pagination?: Pagination | null;
}

export interface PagedData<T> {
  items: T[];
  totalRecords: number;
}