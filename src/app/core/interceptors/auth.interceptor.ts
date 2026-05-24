import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';

import { TokenStorageService } from '../services/auth/token-storage.service';

let isSessionAlertShowing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const token = tokenStorage.getToken();

  const isLoginRequest = req.url.includes('/auth/login');

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        tokenStorage.clear();

        if (!isSessionAlertShowing) {
          isSessionAlertShowing = true;

          alert('Your session has expired. Please login again.');

          isSessionAlertShowing = false;
          router.navigateByUrl('/login', { replaceUrl: true });
        }

        return EMPTY;
      }

      return throwError(() => error);
    }),
  );
};
