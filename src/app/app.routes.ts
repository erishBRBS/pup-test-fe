import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { GreetingComponent } from './pages/greeting/greeting.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

import { authGuard } from './core/guards/auth.guard';
import { homeRedirectGuard } from './core/guards/home-redirect.guard';
import { loginRedirectGuard } from './core/guards/login-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginComponent,
    canActivate: [homeRedirectGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginRedirectGuard]
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [authGuard]
  },
  {
    path: 'greeting',
    component: GreetingComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];