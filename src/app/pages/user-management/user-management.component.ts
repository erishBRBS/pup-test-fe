import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../core/services/auth/auth.service';
import { IdleLogoutService } from '../../core/services/auth/idle-logout.service';
import { SessionUser } from '../../core/models/auth.model';

import { UserService } from '../../core/services/users/user.service';
import { User } from '../../core/models/user.model';

import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import {
  DataTableAction,
  DataTableColumn
} from '../../shared/components/data-table/data-table.model';
import { ModalAction } from '../../shared/enums/modal-action.enum';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    DataTableComponent
  ],
  providers: [MessageService],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly idleLogoutService = inject(IdleLogoutService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  user: SessionUser | null = this.authService.getCurrentUser();

  users: User[] = [];
  loading = false;
  saving = false;

  modalVisible = false;
  selectedModalAction: ModalAction | null = null;
  selectedUser: User | null = null;
  selectedUsers: User[] = [];

  columns: DataTableColumn[] = [
    {
      field: 'username',
      header: 'Username',
      minWidth: '12rem'
    },
    {
      field: 'firstName',
      header: 'First Name',
      minWidth: '12rem'
    },
    {
      field: 'lastName',
      header: 'Last Name',
      minWidth: '12rem'
    },
    {
      field: 'role.roleName',
      header: 'Role',
      minWidth: '10rem'
    },
    {
      field: 'status',
      header: 'Status',
      type: 'boolean',
      minWidth: '10rem'
    }
  ];

  actions: DataTableAction<User>[] = [
    {
      icon: 'pi pi-eye',
      severity: 'info',
      action: (row) => this.openAction(ModalAction.VIEW, row)
    },
    {
      icon: 'pi pi-pencil',
      severity: 'secondary',
      action: (row) => this.openAction(ModalAction.UPDATE, row)
    },
    {
      icon: 'pi pi-trash',
      severity: 'danger',
      action: (row) => this.openDeleteModal([row])
    }
  ];

  get isDeleteMode(): boolean {
    return this.selectedModalAction === ModalAction.DELETE;
  }

  get deleteTitle(): string {
    return this.selectedUsers.length > 1 ? 'Delete Users' : 'Delete User';
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;

        console.error('LOAD USERS ERROR:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error?.error?.message ||
            error?.message ||
            'Failed to load users.'
        });
      }
    });
  }

  addUser(): void {
    this.openAction(ModalAction.ADD);
  }

  bulkDeleteUsers(selectedUsers: User[]): void {
    if (selectedUsers.length === 0) {
      return;
    }

    this.openDeleteModal(selectedUsers);
  }

  openAction(action: ModalAction, user: User | null = null): void {
    this.selectedModalAction = action;
    this.selectedUser = user;

    this.messageService.add({
      severity: 'info',
      summary: action,
      detail: user
        ? `Selected user: ${user.username}`
        : 'Add user selected.'
    });
  }

  openDeleteModal(users: User[]): void {
    this.selectedModalAction = ModalAction.DELETE;
    this.selectedUsers = users;
    this.selectedUser = users.length === 1 ? users[0] : null;
    this.modalVisible = true;
  }

  closeModal(): void {
    this.modalVisible = false;
    this.saving = false;
    this.selectedModalAction = null;
    this.selectedUser = null;
    this.selectedUsers = [];
  }

  confirmDelete(): void {
    if (this.selectedUsers.length === 0) {
      return;
    }

    const ids = this.selectedUsers.map((user) => user.id);

    this.saving = true;

    this.userService.bulkDeleteUsers(ids).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadUsers();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail:
            ids.length === 1
              ? 'User deleted successfully.'
              : 'Selected users deleted successfully.'
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
            'Failed to delete selected user/s.'
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
    this.idleLogoutService.stopWatching();
    this.authService.logout();
    this.user = null;
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}