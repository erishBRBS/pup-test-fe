import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  User
} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly usersUrl = `${environment.apiBaseUrl}users`;

  constructor(private readonly http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.usersUrl}/list-all`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (Array.isArray(response?.data)) {
          return response.data;
        }

        if (Array.isArray(response?.data?.items)) {
          return response.data.items;
        }

        return [];
      })
    );
  }

  bulkDeleteUsers(ids: number[]): Observable<unknown> {
    return this.http.post(`${this.usersUrl}/bulk-delete`, { ids });
  }
}