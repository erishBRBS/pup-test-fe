import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-greeting',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './greeting.component.html',
})
export class GreetingComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user = this.authService.getCurrentUser();

  get displayName(): string {
    const firstName = this.user?.firstName ?? '';
    const lastName = this.user?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || this.user?.username || 'User';
  }

  logout(): void {
    this.authService.logout();
    this.user = null;
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
