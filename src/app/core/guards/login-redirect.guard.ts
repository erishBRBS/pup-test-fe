import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const loginRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const roleName = user?.roleName ?? user?.role?.roleName ?? '';
  const role = roleName.trim().toLowerCase();

  if (role === 'admin') {
    return router.createUrlTree(['/user-management']);
  }

  if (role === 'user') {
    return router.createUrlTree(['/greeting']);
  }

  return true;
};
