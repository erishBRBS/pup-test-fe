import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../core/services/auth/auth.service';
import { IdleLogoutService } from '../../core/services/auth/idle-logout.service';
import { UserService } from '../../core/services/users/user.service';
import { RegisterRequest } from '../../core/models/user.model';

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
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  currentCard: 'login' | 'register' = 'login';

  loading = false;
  errorMessage = '';
  successMessage = '';

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  switchToLogin(): void {
    this.currentCard = 'login';
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset();
    this.cdr.detectChanges();
  }

  switchToRegister(): void {
    this.currentCard = 'register';
    this.errorMessage = '';
    this.successMessage = '';
    this.registerForm.reset();
    this.cdr.detectChanges();
  }

  login(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      username: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? '',
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
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          error?.error?.title ||
          'Invalid username or password.';

        this.cdr.detectChanges();
      },
    });
  }

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const value = this.registerForm.getRawValue();

    if (value.password !== value.confirmPassword) {
      this.errorMessage = 'Password and confirm password do not match.';
      return;
    }

    const payload: RegisterRequest = {
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      username: value.username ?? '',
      password: value.password ?? '',
      roleId: 2,
      status: true,
    };

    this.loading = true;

    this.userService.registerUser(payload).subscribe({
      next: (response) => {
        this.loading = false;

        this.currentCard = 'login';
        this.registerForm.reset();
        this.loginForm.reset({
          username: payload.username,
          password: '',
        });

        this.successMessage =
          response?.message || 'Registration successful. You can now login.';

        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.title ||
          this.getFirstValidationError(error) ||
          'Failed to register account.';

        this.cdr.detectChanges();
      },
    });
  }

  private getFirstValidationError(error: any): string | null {
    const errors = error?.error?.errors;

    if (!errors) {
      return null;
    }

    const firstKey = Object.keys(errors)[0];

    if (!firstKey) {
      return null;
    }

    const firstError = errors[firstKey];

    if (Array.isArray(firstError)) {
      return firstError[0];
    }

    return String(firstError);
  }
}