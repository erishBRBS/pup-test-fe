import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import {
  User,
  UserCreateRequest,
  UserUpdateRequest
} from '../../../core/models/user.model';
import { ModalAction } from '../../../shared/enums/modal-action.enum';

@Component({
  selector: 'app-user-management-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './user-management.modal.html'
})
export class UserManagementModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  readonly ModalAction = ModalAction;

  @Input() visible = false;
  @Input() action: ModalAction | null = null;
  @Input() user: User | null = null;
  @Input() selectedUsers: User[] = [];
  @Input() loading = false;
  @Input() saving = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() createSubmit = new EventEmitter<UserCreateRequest>();
  @Output() updateSubmit = new EventEmitter<{ id: number; payload: UserUpdateRequest }>();
  @Output() deleteSubmit = new EventEmitter<number[]>();

  roleOptions = [
    { label: 'Admin', value: 1 },
    { label: 'User', value: 2 }
  ];

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  form = this.fb.group({
    username: ['', Validators.required],
    password: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    roleId: [2, Validators.required],
    status: [true, Validators.required]
  });

  get isViewMode(): boolean {
    return this.action === ModalAction.VIEW;
  }

  get isAddMode(): boolean {
    return this.action === ModalAction.ADD;
  }

  get isUpdateMode(): boolean {
    return this.action === ModalAction.UPDATE;
  }

  get isDeleteMode(): boolean {
    return this.action === ModalAction.DELETE;
  }

  get isFormMode(): boolean {
    return this.isViewMode || this.isAddMode || this.isUpdateMode;
  }

  get modalTitle(): string {
    switch (this.action) {
      case ModalAction.VIEW:
        return 'View User';
      case ModalAction.ADD:
        return 'Add User';
      case ModalAction.UPDATE:
        return 'Update User';
      case ModalAction.DELETE:
        return this.selectedUsers.length > 1 ? 'Delete Users' : 'Delete User';
      default:
        return 'User';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['action'] || changes['user'] || changes['visible']) {
      this.configureForm();
    }
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  submit(): void {
    if (this.isViewMode) {
      this.close();
      return;
    }

    if (this.isDeleteMode) {
      const ids = this.selectedUsers.map((item) => item.id);
      this.deleteSubmit.emit(ids);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isAddMode) {
      const value = this.form.getRawValue();

      this.createSubmit.emit({
        username: value.username ?? '',
        password: value.password ?? '',
        firstName: value.firstName ?? '',
        lastName: value.lastName ?? '',
        roleId: 2,
        status: true
      });

      return;
    }

    if (this.isUpdateMode && this.user) {
      const value = this.form.getRawValue();

      this.updateSubmit.emit({
        id: this.user.id,
        payload: {
          username: value.username ?? '',
          firstName: value.firstName ?? '',
          lastName: value.lastName ?? '',
          roleId: Number(value.roleId),
          status: value.status === true
        }
      });
    }
  }

  private configureForm(): void {
    this.form.enable();

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();

    if (this.isAddMode) {
      this.form.reset({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: 2,
        status: true
      });

      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
      return;
    }

    if ((this.isViewMode || this.isUpdateMode) && this.user) {
      this.form.reset({
        username: this.user.username,
        password: '',
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        roleId: this.user.role?.id ?? this.user.roleId ?? 2,
        status: this.user.status
      });

      if (this.isViewMode) {
        this.form.disable();
        return;
      }

      if (this.isUpdateMode) {
        this.form.get('password')?.disable();
      }
    }
  }
}