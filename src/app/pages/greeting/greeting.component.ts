import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../core/services/auth/auth.service';
import { TokenStorageService } from '../../core/services/auth/token-storage.service';
import { UserService } from '../../core/services/users/user.service';
import { SessionUser } from '../../core/models/auth.model';
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

  user: SessionUser | null = this.authService.getCurrentUser();

  currentView: 'welcome' | 'profile' = 'welcome';
  editMode = false;
  saving = false;

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
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
  }

  backToWelcome(): void {
    this.currentView = 'welcome';
    this.editMode = false;
  }

  editProfile(): void {
    this.editMode = true;
    this.patchProfileForm();
  }

  cancelEdit(): void {
    this.editMode = false;
    this.patchProfileForm();
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.user) {
      return;
    }

    const value = this.form.getRawValue();

    const payload: UserProfileUpdateRequest = {
      firstName: value.firstName,
      lastName: value.lastName,
      username: value.username
    };

    this.saving = true;

    this.userService.updateProfile(payload).subscribe({
      next: (response) => {
        this.saving = false;

        const updatedUser: SessionUser = {
          ...this.user!,
          firstName: response.data?.firstName ?? payload.firstName,
          lastName: response.data?.lastName ?? payload.lastName,
          username: response.data?.username ?? payload.username,
          role: this.user?.role,
          roleName: this.user?.roleName
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
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private patchProfileForm(): void {
    this.form.setValue({
      firstName: this.user?.firstName ?? '',
      lastName: this.user?.lastName ?? '',
      username: this.user?.username ?? '',
    });
  }
}