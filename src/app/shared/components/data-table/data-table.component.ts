import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DataTableAction, DataTableColumn } from './data-table.model';
import { PaginationHelper } from '../../helpers/pagination.helper';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CheckboxModule,
    TagModule,
    SkeletonModule,
  ],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T extends Record<string, any>> {
  @Input() title = '';
  @Input() subtitle = '';

  @Input() data: T[] = [];
  @Input() columns: DataTableColumn[] = [];
  @Input() actions: DataTableAction<T>[] = [];

  @Input() loading = false;
  @Input() dataKey = 'id';

  @Input() addButtonLabel = 'Add';
  @Input() deleteButtonLabel = 'Delete';

  @Input() rows = PaginationHelper.defaultPageSize;
  @Input() rowsPerPageOptions = PaginationHelper.rowsPerPageOptions;

  @Output() addClicked = new EventEmitter<void>();
  @Output() bulkDeleteClicked = new EventEmitter<T[]>();
  @Output() selectionChanged = new EventEmitter<T[]>();

  selectedRows: T[] = [];
  selectAllChecked = false;
  searchValue = '';

  skeletonRows: any[] = Array.from({ length: PaginationHelper.defaultPageSize }).map((_, index) => ({
    id: `skeleton-${index}`,
  }));

  get tableValue(): any[] {
    return this.loading ? this.skeletonRows : this.data;
  }

  get globalFilterFields(): string[] {
    return this.columns.map((column) => column.field);
  }

  onSearchInput(table: Table, value: string): void {
    this.searchValue = value;
    table.first = 0;
    table.filterGlobal(value.trim(), 'contains');

    if (!value.trim()) {
      this.selectAllChecked = false;
      this.selectedRows = [];
      this.selectionChanged.emit(this.selectedRows);
    }
  }

  clear(table: Table): void {
    this.searchValue = '';
    this.selectedRows = [];
    this.selectAllChecked = false;

    table.clear();
    table.first = 0;
    table.filterGlobal('', 'contains');

    this.selectionChanged.emit(this.selectedRows);
  }

  toggleSelectAllPage(checked: boolean | undefined, table: Table): void {
    if (this.loading) {
      return;
    }

    this.selectAllChecked = !!checked;

    const filteredRows = table.filteredValue as T[] | null | undefined;
    const rowsToSelect = filteredRows ?? this.data;

    this.selectedRows = this.selectAllChecked ? [...rowsToSelect] : [];

    this.selectionChanged.emit(this.selectedRows);
  }

  onSelectionChange(): void {
    this.selectAllChecked =
      this.data.length > 0 && this.selectedRows.length === this.data.length;

    this.selectionChanged.emit(this.selectedRows);
  }

  onBulkDelete(): void {
    if (this.selectedRows.length === 0) {
      return;
    }

    this.bulkDeleteClicked.emit(this.selectedRows);
  }

  getValue(row: T, field: string): any {
    return field.split('.').reduce((value, key) => value?.[key], row);
  }

  getBooleanLabel(value: boolean): string {
    return value ? 'Active' : 'Inactive';
  }

  getBooleanSeverity(value: boolean): 'success' | 'danger' {
    return value ? 'success' : 'danger';
  }
}