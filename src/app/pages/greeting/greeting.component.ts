import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../core/services/auth/auth.service';
import { TokenStorageService } from '../../core/services/auth/token-storage.service';
import { UserService } from '../../core/services/users/user.service';
import { ChangePasswordRequest, SessionUser } from '../../core/models/auth.model';
import { UserProfileUpdateRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-greeting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './greeting.component.html',
})
export class GreetingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  user: SessionUser | null = this.authService.getCurrentUser();

  currentView: 'welcome' | 'profile' | 'changePassword' = 'welcome';
  editMode = false;
  saving = false;

  profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
  });

  passwordForm = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  get displayName(): string {
    const firstName = this.user?.firstName ?? '';
    const lastName = this.user?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || this.user?.username || 'User';
  }

  showProfile(): void {
    this.currentView = 'profile';
    this.editMode = false;
    this.patchProfileForm();
    this.cdr.detectChanges();
  }

  showChangePassword(): void {
    this.currentView = 'changePassword';
    this.editMode = false;

    this.passwordForm.reset({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    this.cdr.detectChanges();
  }

  backToWelcome(): void {
    this.currentView = 'welcome';
    this.editMode = false;
    this.cdr.detectChanges();
  }

  backToProfile(): void {
    this.currentView = 'profile';
    this.editMode = false;
    this.cdr.detectChanges();
  }

  editProfile(): void {
    this.editMode = true;
    this.patchProfileForm();
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editMode = false;
    this.patchProfileForm();
    this.cdr.detectChanges();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    if (!this.user) {
      return;
    }

    const value = this.profileForm.getRawValue();

    const payload: UserProfileUpdateRequest = {
      firstName: value.firstName,
      lastName: value.lastName,
      username: value.username
    };

    this.saving = true;
    this.cdr.detectChanges();

    this.userService.updateProfile(payload).subscribe({
      next: (response) => {
        this.saving = false;

        const updatedUser: SessionUser = {
          ...this.user!,
          firstName: response.data?.firstName ?? payload.firstName,
          lastName: response.data?.lastName ?? payload.lastName,
          username: response.data?.username ?? payload.username,
          role: response.data?.role ?? this.user?.role,
          roleName: response.data?.roleName ?? this.user?.roleName,
          status: response.data?.status ?? this.user?.status ?? true
        };

        this.user = updatedUser;
        this.tokenStorage.saveUser(updatedUser);

        this.editMode = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response?.message || 'Profile updated successfully.',
          life: 3000
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.saving = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error?.error?.message ||
            error?.message ||
            'Failed to update profile.',
          life: 3000
        });

        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const value = this.passwordForm.getRawValue();

    if (value.newPassword !== value.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'New password and confirm password do not match.',
        life: 3000
      });
      return;
    }

    const payload: ChangePasswordRequest = {
      oldPassword: value.oldPassword,
      newPassword: value.newPassword,
      confirmPassword: value.confirmPassword
    };

    this.saving = true;
    this.cdr.detectChanges();

    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        this.saving = false;

        alert(response?.message || 'Password changed successfully. Please login again.');

        this.authService.logoutRequest().subscribe({
          next: () => this.completeLogout(),
          error: () => this.completeLogout()
        });
      },
      error: (error) => {
        this.saving = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error?.error?.message ||
            error?.message ||
            'Failed to change password.',
          life: 3000
        });

        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logoutRequest().subscribe({
      next: () => this.completeLogout(),
      error: () => this.completeLogout()
    });
  }

  private completeLogout(): void {
    this.authService.logout();
    this.user = null;
    this.cdr.detectChanges();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private patchProfileForm(): void {
    this.profileForm.setValue({
      firstName: this.user?.firstName ?? '',
      lastName: this.user?.lastName ?? '',
      username: this.user?.username ?? '',
    });
  }
}