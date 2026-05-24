import { Injectable } from '@angular/core';
import { SessionUser } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveUser(user: SessionUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): SessionUser | null {
    const value = localStorage.getItem(this.userKey);

    if (!value) return null;

    try {
      return JSON.parse(value) as SessionUser;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}