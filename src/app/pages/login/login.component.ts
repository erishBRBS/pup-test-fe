import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../core/services/auth/auth.service';
import { IdleLogoutService } from '../../core/services/auth/idle-logout.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly idleLogoutService = inject(IdleLogoutService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  login(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      username: this.form.value.username ?? '',
      password: this.form.value.password ?? '',
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        this.loading = false;

        const user = response.data.user;
        const roleName = user.role?.roleName ?? user.roleName ?? '';
        const role = roleName.toLowerCase();

        if (role === 'admin') {
          this.idleLogoutService.startWatching();
          this.router.navigateByUrl('/user-management');
          return;
        }

        if (role === 'user') {
          this.idleLogoutService.startWatching();
          this.router.navigateByUrl('/greeting');
          return;
        }

        this.idleLogoutService.stopWatching();
        this.authService.logout();
        this.errorMessage = `Unknown role: ${roleName}`;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || error?.error?.title || 'Invalid username or password.';
      },
    });
  }
}
