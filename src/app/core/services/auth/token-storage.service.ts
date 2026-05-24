import { Injectable } from '@angular/core';
import { SessionUser } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'auth_user';

  saveAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  saveToken(token: string): void {
    this.saveAccessToken(token);
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  saveUser(user: SessionUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): SessionUser | null {
    const value = localStorage.getItem(this.userKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as SessionUser;
    } catch {
      return null;
    }
  }

  saveSession(accessToken: string, refreshToken: string, user?: SessionUser): void {
    this.saveAccessToken(accessToken);
    this.saveRefreshToken(refreshToken);

    if (user) {
      this.saveUser(user);
    }
  }

  clear(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }
}