import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponseData,
  RefreshTokenResponseData,
  SessionUser,
  TokenResponse,
} from '../../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
  ) {}

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponseData>> {
    return this.http
      .post<ApiResponse<LoginResponseData>>(`${this.apiBaseUrl}/${environment.loginPath}`, payload)
      .pipe(
        tap((response) => {
          const data = response.data;

          const accessToken = typeof data.token === 'string' ? data.token : data.token.accessToken;

          const refreshToken = typeof data.token === 'string' ? '' : data.token.refreshToken;

          const user: SessionUser = {
            ...data.user,
            roleName: data.user.role?.roleName ?? data.user.roleName,
          };

          this.tokenStorage.saveAccessToken(accessToken);

          if (refreshToken) {
            this.tokenStorage.saveRefreshToken(refreshToken);
          }

          this.tokenStorage.saveUser(user);
        }),
      );
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found.'));
    }

    return this.http
      .post<
        ApiResponse<RefreshTokenResponseData>
      >(`${this.apiBaseUrl}/${environment.refreshPath}`, { refreshToken })
      .pipe(
        map((response) => this.extractTokenResponse(response.data)),
        tap((tokenData) => {
          this.tokenStorage.saveAccessToken(tokenData.accessToken);
          this.tokenStorage.saveRefreshToken(tokenData.refreshToken);
        }),
        map((tokenData) => tokenData.accessToken),
      );
  }

  logoutRequest(): Observable<unknown> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    return this.http
      .post(`${this.apiBaseUrl}/${environment.logoutPath}`, {
        refreshToken,
      })
      .pipe(
        catchError(() => {
          return of(null);
        }),
      );
  }

  getCurrentUser(): SessionUser | null {
    return this.tokenStorage.getUser();
  }

  getToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.tokenStorage.clear();
  }

  private extractTokenResponse(data: RefreshTokenResponseData): TokenResponse {
    if (data.token) {
      return data.token;
    }

    if (
      data.accessToken &&
      data.accessTokenExpiresAt &&
      data.refreshToken &&
      data.refreshTokenExpiresAt
    ) {
      return {
        accessToken: data.accessToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
        refreshToken: data.refreshToken,
        refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      };
    }

    throw new Error('Invalid refresh token response.');
  }

  changePassword(payload: ChangePasswordRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiBaseUrl}/auth/change-password`, payload);
  }
}
