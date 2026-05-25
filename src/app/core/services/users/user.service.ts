import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SessionUser } from '../../models/auth.model';
import {
  ApiResponse,
  RegisterRequest,
  User,
  UserCreateRequest,
  UserProfileUpdateRequest,
  UserUpdateRequest
} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly usersUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/users`;

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

  getUserById(id: number): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.usersUrl}/get/${id}`)
      .pipe(map((response) => response.data));
  }

  createUser(payload: UserCreateRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.usersUrl}/create`, payload);
  }

  registerUser(payload: RegisterRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.usersUrl}/register`, payload);
  }

  updateUser(id: number, payload: UserUpdateRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.usersUrl}/update/${id}`, payload);
  }

  updateProfile(payload: UserProfileUpdateRequest): Observable<ApiResponse<SessionUser>> {
    return this.http.put<ApiResponse<SessionUser>>(
      `${this.usersUrl}/profile/update`,
      payload
    );
  }

  bulkDeleteUsers(ids: number[]): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.usersUrl}/bulk-delete`, {
      ids
    });
  }
}