export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Role {
  id: number;
  roleName: string;
}

export interface SessionUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role?: Role;
  roleName?: string;
  status: boolean;
}

export interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface LoginResponseData {
  user: SessionUser;
  token: TokenResponse;
}

export interface RefreshTokenResponseData {
  accessToken?: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  token?: TokenResponse;
}