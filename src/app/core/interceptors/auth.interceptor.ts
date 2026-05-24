import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
import { TokenStorageService } from '../services/auth/token-storage.service';

let isRefreshing = false;
let isSessionAlertShowing = false;

const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const accessToken = tokenStorage.getAccessToken();

  const isLoginRequest = req.url.includes('/auth/login');
  const isRefreshRequest =
    req.url.includes('/auth/refresh-token') || req.url.includes('/auth/refresh');
  const isLogoutRequest = req.url.includes('/auth/logout');

  const shouldAttachAccessToken = !!accessToken && !isLoginRequest && !isRefreshRequest;

  const authReq = shouldAttachAccessToken ? addToken(req, accessToken) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest && !isRefreshRequest && !isLogoutRequest) {
        return handle401Error(authReq, next, authService, tokenStorage, router);
      }

      return throwError(() => error);
    }),
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenStorage: TokenStorageService,
  router: Router,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((newAccessToken) => {
        isRefreshing = false;
        refreshTokenSubject.next(newAccessToken);

        return next(addToken(request, newAccessToken));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        tokenStorage.clear();

        showSessionExpiredAlert(router);

        return throwError(() => refreshError);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => {
      return next(addToken(request, token));
    }),
  );
}

function showSessionExpiredAlert(router: Router): void {
  if (isSessionAlertShowing) {
    return;
  }

  isSessionAlertShowing = true;

  alert('Your session has expired. Please login again.');

  isSessionAlertShowing = false;

  router.navigateByUrl('/login', { replaceUrl: true });
}
