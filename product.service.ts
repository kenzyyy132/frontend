import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiListResponse, ApiSuccess, PagedResult } from '../models/api.model';
import { Product, ProductPayload, ProductQuery } from '../models/product.model';


@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  list(query: ProductQuery = {}): Observable<PagedResult<Product>> {
    return this.http
      .get<ApiListResponse<Product>>(this.baseUrl, { params: this.toParams(query) })
      .pipe(map((res) => ({ items: res.data, pagination: res.pagination })));
  }

  getById(id: string): Observable<Product> {
    return this.http
      .get<ApiSuccess<Product>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  facets(): Observable<{ categories: string[]; brands: string[] }> {
    return this.http
      .get<ApiSuccess<{ categories: string[]; brands: string[] }>>(`${this.baseUrl}/categories`)
      .pipe(map((res) => res.data));
  }

  create(payload: ProductPayload | FormData): Observable<Product> {
    return this.http
      .post<ApiSuccess<Product>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: string, payload: Partial<ProductPayload> | FormData): Observable<Product> {
    return this.http
      .put<ApiSuccess<Product>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  remove(id: string): Observable<Product> {
    return this.http
      .delete<ApiSuccess<Product>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  
  imageUrl(image: string | undefined | null): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `${environment.apiOrigin}${image}`;
  }

  private toParams(query: ProductQuery): HttpParams {
    let params = new HttpParams();

    const add = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') return;
      params = params.set(key, String(value));
    };

    add('page', query.page);
    add('limit', query.limit);
    add('category', query.category);
    add('brand', query.brand);
    add('search', query.search);
    add('minPrice', query.minPrice);
    add('maxPrice', query.maxPrice);
    add('sort', query.sort);

   
    if (query.inStock === true || query.inStock === false) {
      params = params.set('inStock', String(query.inStock));
    }

    return params;
  }
}
