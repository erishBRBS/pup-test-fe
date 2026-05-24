import { DataTableQuery } from '../components/data-table/data-table.model';

export class PaginationHelper {
  static readonly defaultPageNumber = 1;
  static readonly defaultPageSize = 10;
  static readonly rowsPerPageOptions = [10, 25, 50];

  static createDefaultQuery(): DataTableQuery {
    return {
      pageNumber: this.defaultPageNumber,
      pageSize: this.defaultPageSize,
      search: '',
      sortField: undefined,
      sortDirection: undefined
    };
  }

  static fromPrimeLazyLoadEvent(
    event: any,
    search = ''
  ): DataTableQuery {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.defaultPageSize;

    return {
      pageNumber: Math.floor(first / rows) + 1,
      pageSize: rows,
      search: search.trim(),
      sortField: event.sortField || undefined,
      sortDirection: this.getSortDirection(event.sortOrder)
    };
  }

  static resetToFirstPage(
    pageSize = this.defaultPageSize,
    search = ''
  ): DataTableQuery {
    return {
      pageNumber: 1,
      pageSize,
      search: search.trim(),
      sortField: undefined,
      sortDirection: undefined
    };
  }

  private static getSortDirection(
    sortOrder: number | undefined
  ): 'asc' | 'desc' | undefined {
    if (sortOrder === 1) {
      return 'asc';
    }

    if (sortOrder === -1) {
      return 'desc';
    }

    return undefined;
  }
}