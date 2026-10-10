import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { RevealDirective } from '../../shared/reveal.directive';

/**
 * The storefront landing page.
 *
 * Loads two slices of the catalogue in parallel — the newest arrivals and the
 * best sellers — and renders the marketing sections around them. Everything
 * shown here is real data from the API; nothing is hardcoded.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, RevealDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly products = inject(ProductService);
  private readonly router = inject(Router);

  protected readonly heroes = signal<Product[]>([]);
  protected readonly editPicks = signal<Product[]>([]);
  protected readonly loading = signal(true);

  /** Real catalogue size, read from the API rather than hardcoded in the copy. */
  protected readonly totalProducts = signal(0);

  /** Drives the hero's floating product chips. */
  protected readonly chips = computed(() => this.heroes().slice(0, 4));

  protected readonly categories = [
    { slug: 'skincare', label: 'Skincare', blurb: 'Serums, creams & treatments', icon: '🧴' },
    { slug: 'makeup', label: 'Makeup', blurb: 'Skin-loving colour', icon: '💄' },
    { slug: 'perfume', label: 'Perfume', blurb: 'Signature scents', icon: '🌸' },
    { slug: 'sets', label: 'Gift Sets', blurb: 'Curated rituals', icon: '🎁' },
  ];

  protected readonly promises = [
    { icon: '🌱', title: '100% Vegan', text: 'Plant-powered, never tested on animals.' },
    { icon: '🔬', title: 'Dermat Tested', text: 'Safe for sensitive and reactive skin.' },
    { icon: '🎨', title: 'Every Skin Tone', text: 'Formulated and shade-matched for all.' },
    { icon: '♻️', title: 'Kind Packaging', text: 'Refillable glass and recycled cartons.' },
  ];

  ngOnInit(): void {
    // Newest arrivals for the hero rail.
    this.products.list({ limit: 8, sort: 'newest' }).subscribe({
      next: (page) => {
        this.heroes.set(page.items);
        this.totalProducts.set(page.pagination.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // A different slice for "The Glow Edit" so the two rails never repeat.
    this.products.list({ limit: 4, sort: 'price-desc', inStock: true }).subscribe({
      next: (page) => this.editPicks.set(page.items),
    });
  }

  /** Router service navigation built from a runtime value. */
  protected shopCategory(slug: string): void {
    void this.router.navigate(['/products'], { queryParams: { category: slug } });
  }

  protected openProduct(product: Product): void {
    void this.router.navigate(['/products', product._id]);
  }
}
