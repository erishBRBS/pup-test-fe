import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  LoginRequest,
  LoginResponseData,
  SessionUser
} from '../../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) {}

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponseData>> {
    return this.http
      .post<ApiResponse<LoginResponseData>>(
        `${environment.apiBaseUrl}${environment.loginPath}`,
        payload
      )
      .pipe(
        tap((response) => {
          const data = response.data;

          const token =
            typeof data.token === 'string'
              ? data.token
              : data.token.accessToken;

          const user: SessionUser = {
            ...data.user,
            roleName: data.user.role?.roleName ?? data.user.roleName
          };

          this.tokenStorage.saveToken(token);
          this.tokenStorage.saveUser(user);
        })
      );
  }

  logoutRequest(): Observable<unknown> {
    return this.http
      .post(`${environment.apiBaseUrl}${environment.logoutPath}`, {})
      .pipe(
        catchError(() => {
          return of(null);
        })
      );
  }

  getCurrentUser(): SessionUser | null {
    return this.tokenStorage.getUser();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.tokenStorage.clear();

    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
  }
}