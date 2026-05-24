import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'user-management',
    loadComponent: () =>
      import('./pages/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      )
  },
  {
    path: 'greeting',
    loadComponent: () =>
      import('./pages/greeting/greeting.component').then(
        (m) => m.GreetingComponent
      )
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];