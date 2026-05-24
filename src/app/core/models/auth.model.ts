export interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data: T;
  statusCode?: number;
  pagination?: unknown;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  user: SessionUser;
  token: AuthToken | string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface UserRole {
  id: number;
  roleName: string;
}

export interface SessionUser {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: boolean;

  role?: UserRole;
  roleName?: string;
}