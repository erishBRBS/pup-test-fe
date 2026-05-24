import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user = this.authService.getCurrentUser();

  logout(): void {
    this.authService.logout();
    this.user = null;
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
