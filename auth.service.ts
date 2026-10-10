import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccess } from '../models/api.model';
import {
  AuthResponse,
  LoginPayload,
  ProfilePayload,
  RegisterPayload,
  User,
} from '../models/user.model';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'lumora.token';
const USER_KEY = 'lumora.user';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

 
  private readonly _token = signal<string | null>(this.storage.get<string | null>(TOKEN_KEY, null));
  private readonly _user = signal<User | null>(this.storage.get<User | null>(USER_KEY, null));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  
  readonly isLoggedIn = computed(() => this._token() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly displayName = computed(() => this._user()?.name ?? 'Guest');
  readonly initials = computed(() => {
    const name = this._user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  });

  
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((res) => this.persist(res.token, res.data)));
  }

  
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((res) => this.persist(res.token, res.data)));
  }

  
  me(): Observable<ApiSuccess<User>> {
    return this.http
      .get<ApiSuccess<User>>(`${this.baseUrl}/me`)
      .pipe(tap((res) => this.setUser(res.data)));
  }

  
  updateProfile(payload: ProfilePayload | FormData): Observable<ApiSuccess<User>> {
    return this.http
      .put<ApiSuccess<User>>(`${environment.apiBaseUrl}/users/me`, payload)
      .pipe(tap((res) => this.setUser(res.data)));
  }

  setUser(user: User): void {
    this._user.set(user);
    this.storage.set(USER_KEY, user);
  }

 
  logout(redirectTo = '/'): void {
    this._token.set(null);
    this._user.set(null);
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);

   
    void this.router.navigateByUrl(redirectTo);
  }

  private persist(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    this.storage.set(TOKEN_KEY, token);
    this.storage.set(USER_KEY, user);
  }
}
