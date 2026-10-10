import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PagedResult } from '../../../core/models/api.model';
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  PRODUCT_SORTS,
  Product,
  ProductCategory,
  ProductSort,
  SORT_LABELS,
} from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { RevealDirective } from '../../../shared/reveal.directive';

/**
 * The catalogue.
 *
 * Filter state lives in signals and is mirrored into the URL query string, so
 * a filtered view is shareable, survives a refresh, and the browser back button
 * behaves. Reading the URL is the single source of truth: the component reacts
 * to `queryParams`, and every control writes to the URL rather than to state
 * directly.
 */
@Component({
  selector: 'app-product-list',
  imports: [ProductCard, RevealDirective],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly products = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly sorts = PRODUCT_SORTS;
  protected readonly sortLabels = SORT_LABELS;

  protected readonly items = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly brands = signal<string[]>([]);
  protected readonly filtersOpen = signal(false);

  protected readonly pagination = signal({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  /* ---- Filter state, hydrated from the URL ------------------------------- */
  protected readonly search = signal('');
  protected readonly category = signal<ProductCategory | ''>('');
  protected readonly brand = signal('');
  protected readonly sort = signal<ProductSort>('newest');
  protected readonly inStockOnly = signal(false);
  protected readonly page = signal(1);

  /** True when anything is filtered — drives the "Clear all" button. */
  protected readonly hasFilters = computed(
    () =>
      this.search() !== '' ||
      this.category() !== '' ||
      this.brand() !== '' ||
      this.inStockOnly() ||
      this.sort() !== 'newest',
  );

  protected readonly resultLabel = computed(() => {
    const { total } = this.pagination();
    if (total === 0) return 'No products';
    return total === 1 ? '1 product' : `${total} products`;
  });

  /** Page numbers for the pager, capped so it never overflows on mobile. */
  protected readonly pageNumbers = computed(() => {
    const { page, totalPages } = this.pagination();
    const span = 2;
    const from = Math.max(1, page - span);
    const to = Math.min(totalPages, page + span);

    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  });

  constructor() {
    // Re-fetch whenever any filter signal changes. Declared once here instead
    // of calling load() at the end of every handler.
    effect(() => {
      const query = {
        page: this.page(),
        limit: 12,
        search: this.search(),
        category: this.category(),
        brand: this.brand(),
        sort: this.sort(),
        inStock: this.inStockOnly() ? true : null,
      };

      this.loading.set(true);

      this.products.list(query).subscribe({
        next: (result: PagedResult<Product>) => {
          this.items.set(result.items);
          this.pagination.set({
            total: result.pagination.total,
            page: result.pagination.page,
            limit: result.pagination.limit,
            totalPages: result.pagination.totalPages,
          });
          this.loading.set(false);
        },
        error: () => {
          this.items.set([]);
          this.loading.set(false);
        },
      });
    });
  }

  ngOnInit(): void {
    // The URL drives the filters, so deep links and the back button both work.
    this.route.queryParamMap.subscribe((params) => {
      this.search.set(params.get('search') ?? '');
      this.brand.set(params.get('brand') ?? '');
      this.inStockOnly.set(params.get('inStock') === 'true');
      this.page.set(Number(params.get('page')) || 1);

      const cat = params.get('category') as ProductCategory | null;
      this.category.set(cat && PRODUCT_CATEGORIES.includes(cat) ? cat : '');

      const sort = params.get('sort') as ProductSort | null;
      this.sort.set(sort && PRODUCT_SORTS.includes(sort) ? sort : 'newest');
    });

    this.products.facets().subscribe({
      next: (facets) => this.brands.set(facets.brands),
      error: () => undefined,
    });
  }

  /**
   * Every control routes through here: it writes the change into the URL and
   * the queryParamMap subscription above feeds it back into the signals.
   */
  private patchQuery(patch: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: patch,
      queryParamsHandling: 'merge',
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.patchQuery({ search: value || null, page: null });
  }

  protected selectCategory(value: ProductCategory | ''): void {
    this.patchQuery({ category: value || null, page: null });
  }

  protected selectBrand(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.patchQuery({ brand: value || null, page: null });
  }

  protected selectSort(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ProductSort;
    this.patchQuery({ sort: value === 'newest' ? null : value, page: null });
  }

  protected toggleInStock(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.patchQuery({ inStock: checked ? 'true' : null, page: null });
  }

  protected goToPage(page: number): void {
    this.patchQuery({ page: page === 1 ? null : page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected clearFilters(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  protected openProduct(product: Product): void {
    void this.router.navigate(['/products', product._id]);
  }
}
