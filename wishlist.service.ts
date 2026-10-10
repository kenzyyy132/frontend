import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccess } from '../models/api.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';


@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly baseUrl = `${environment.apiBaseUrl}/users/me/wishlist`;

  private readonly _items = signal<Product[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  private readonly ids = computed(() => new Set(this._items().map((p) => p._id)));

  has(productId: string): boolean {
    return this.ids().has(productId);
  }

  load(): Observable<Product[]> {
    return this.http
      .get<ApiSuccess<Product[]>>(this.baseUrl)
      .pipe(
        map((res) => res.data),
        tap((items) => this._items.set(items)),
      );
  }

  add(productId: string): Observable<Product[]> {
    return this.http
      .post<ApiSuccess<Product[]>>(`${this.baseUrl}/${productId}`, {})
      .pipe(
        map((res) => res.data),
        tap((items) => this._items.set(items)),
      );
  }

  remove(productId: string): Observable<Product[]> {
    return this.http
      .delete<ApiSuccess<Product[]>>(`${this.baseUrl}/${productId}`)
      .pipe(
        map((res) => res.data),
        tap((items) => this._items.set(items)),
      );
  }

  toggle(productId: string): Observable<Product[]> {
    return this.has(productId) ? this.remove(productId) : this.add(productId);
  }

  clear(): void {
    this._items.set([]);
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
