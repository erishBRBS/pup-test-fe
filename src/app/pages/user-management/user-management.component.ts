import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../core/services/auth/auth.service';
import { IdleLogoutService } from '../../core/services/auth/idle-logout.service';
import { SessionUser } from '../../core/models/auth.model';

import { UserService } from '../../core/services/users/user.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../../core/models/user.model';

import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import {
  DataTableAction,
  DataTableColumn,
} from '../../shared/components/data-table/data-table.model';
import { ModalAction } from '../../shared/enums/modal-action.enum';
import { UserManagementModalComponent } from './modal/user-management.modal';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    DataTableComponent,
    UserManagementModalComponent,
  ],
  providers: [MessageService],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly idleLogoutService = inject(IdleLogoutService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly protectedAdminId = 1;

  user: SessionUser | null = this.authService.getCurrentUser();

  users: User[] = [];
  loading = false;
  modalLoading = false;
  saving = false;

  modalVisible = false;
  selectedModalAction: ModalAction | null = null;
  selectedUser: User | null = null;
  selectedUsers: User[] = [];

  columns: DataTableColumn[] = [
    {
      field: 'firstName',
      header: 'First Name',
      minWidth: '12rem',
    },
    {
      field: 'lastName',
      header: 'Last Name',
      minWidth: '12rem',
    },
    {
      field: 'role.roleName',
      header: 'Role',
      minWidth: '10rem',
    },
    {
      field: 'status',
      header: 'Status',
      type: 'boolean',
      minWidth: '10rem',
    },
  ];

  actions: DataTableAction<User>[] = [
    {
      icon: 'pi pi-eye',
      severity: 'info',
      action: (row) => this.openViewModal(row),
      disabled: (row) => this.isProtectedUser(row),
    },
    {
      icon: 'pi pi-pencil',
      severity: 'secondary',
      action: (row) => this.openUpdateModal(row),
      disabled: (row) => this.isProtectedUser(row),
    },
    {
      icon: 'pi pi-trash',
      severity: 'danger',
      action: (row) => this.openDeleteModal([row]),
      disabled: (row) => this.isProtectedUser(row),
    },
  ];

  ngOnInit(): void {
    this.refreshCurrentUser();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || error?.message || 'Failed to load users.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });
  }

  addUser(): void {
    this.selectedModalAction = ModalAction.ADD;
    this.selectedUser = null;
    this.selectedUsers = [];
    this.modalVisible = true;
    this.cdr.detectChanges();
  }

  openViewModal(user: User): void {
    this.selectedModalAction = ModalAction.VIEW;
    this.selectedUser = null;
    this.selectedUsers = [];
    this.modalVisible = true;
    this.modalLoading = true;
    this.cdr.detectChanges();

    this.userService.getUserById(user.id).subscribe({
      next: (freshUser) => {
        this.selectedUser = freshUser;
        this.modalLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.modalLoading = false;
        this.closeModal();

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || error?.message || 'Failed to load user details.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });
  }

  openUpdateModal(user: User): void {
    this.selectedModalAction = ModalAction.UPDATE;
    this.selectedUser = null;
    this.selectedUsers = [];
    this.modalVisible = true;
    this.modalLoading = true;
    this.cdr.detectChanges();

    this.userService.getUserById(user.id).subscribe({
      next: (freshUser) => {
        this.selectedUser = freshUser;
        this.modalLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.modalLoading = false;
        this.closeModal();

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || error?.message || 'Failed to load user details.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });
  }

  openDeleteModal(users: User[]): void {
    const allowedUsers = users.filter((user) => !this.isProtectedUser(user));

    if (allowedUsers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not allowed',
        detail: 'The main admin account cannot be deleted.',
        life: 3000,
      });
      return;
    }

    this.selectedModalAction = ModalAction.DELETE;
    this.selectedUser = allowedUsers.length === 1 ? allowedUsers[0] : null;
    this.selectedUsers = allowedUsers;
    this.modalVisible = true;
    this.cdr.detectChanges();
  }

  bulkDeleteUsers(selectedUsers: User[]): void {
    const allowedUsers = selectedUsers.filter((user) => !this.isProtectedUser(user));

    if (allowedUsers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not allowed',
        detail: 'The main admin account cannot be deleted.',
        life: 3000,
      });
      return;
    }

    this.openDeleteModal(allowedUsers);
  }

  closeModal(): void {
    this.modalVisible = false;
    this.modalLoading = false;
    this.saving = false;
    this.selectedModalAction = null;
    this.selectedUser = null;
    this.selectedUsers = [];
    this.cdr.detectChanges();
  }

  handleCreateUser(payload: UserCreateRequest): void {
    this.saving = true;
    this.cdr.detectChanges();

    this.userService.createUser(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.closeModal();
        this.loadUsers();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response?.message || 'User created successfully.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.saving = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || error?.message || 'Failed to create user.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });
  }

  handleUpdateUser(event: { id: number; payload: UserUpdateRequest }): void {
    this.saving = true;
    this.cdr.detectChanges();

    this.userService.updateUser(event.id, event.payload).subscribe({
      next: (response) => {
        this.saving = false;

        this.updateCurrentUserIfNeeded(event.id, event.payload);

        this.closeModal();
        this.loadUsers();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: response?.message || 'User updated successfully.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.saving = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || error?.message || 'Failed to update user.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });
  }

  handleDeleteUsers(ids: number[]): void {
    const safeIds = ids.filter((id) => id !== this.protectedAdminId);

    if (safeIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not allowed',
        detail: 'The main admin account cannot be deleted.',
        life: 3000,
      });
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    this.userService.bulkDeleteUsers(safeIds).subscribe({
      next: (response) => {
        this.saving = false;
        this.closeModal();
        this.loadUsers();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail:
            response?.message ||
            (safeIds.length === 1
              ? 'User deleted successfully.'
              : 'Selected users deleted successfully.'),
          life: 3000,
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.saving = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.message || error?.message || 'Failed to delete selected user/s.',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });
  }

  isProtectedUser = (user: User): boolean => {
    return user.id === this.protectedAdminId;
  };

  logout(): void {
    this.authService.logoutRequest().subscribe({
      next: () => this.completeLogout(),
      error: () => this.completeLogout(),
    });
  }

  private completeLogout(): void {
    this.idleLogoutService.stopWatching();
    this.authService.logout();
    this.user = null;
    this.cdr.detectChanges();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private refreshCurrentUser(): void {
    this.user = this.authService.getCurrentUser();
    this.cdr.detectChanges();
  }

  private updateCurrentUserIfNeeded(updatedUserId: number, payload: UserUpdateRequest): void {
    if (!this.user || this.user.id !== updatedUserId) {
      return;
    }

    const updatedUser: SessionUser = {
      ...this.user,
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      status: payload.status,
      role: {
        id: payload.roleId,
        roleName: payload.roleId === 1 ? 'Admin' : 'User',
      },
      roleName: payload.roleId === 1 ? 'Admin' : 'User',
    };

    this.user = updatedUser;

    localStorage.setItem('auth_user', JSON.stringify(updatedUser));

    this.cdr.detectChanges();
  }
}