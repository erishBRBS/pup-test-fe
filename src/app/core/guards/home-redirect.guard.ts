import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const homeRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const user = authService.getCurrentUser();
  const roleName = user?.roleName ?? user?.role?.roleName ?? '';
  const role = roleName.trim().toLowerCase();

  if (role === 'admin') {
    return router.createUrlTree(['/user-management']);
  }

  if (role === 'user') {
    return router.createUrlTree(['/greeting']);
  }

  authService.logout();
  return router.createUrlTree(['/login']);
};