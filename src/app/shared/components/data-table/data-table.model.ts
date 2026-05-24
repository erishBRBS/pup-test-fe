export type DataTableColumnType = 'text' | 'boolean' | 'date';

export interface DataTableColumn {
  field: string;
  header: string;
  type?: DataTableColumnType;
  sortable?: boolean;
  minWidth?: string;
}

export interface DataTableAction<T> {
  label?: string;
  icon: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  action: (row: T) => void;
  disabled?: (row: T) => boolean;
}

export interface DataTableQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}