import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductCard } from '../../shared/components/product-card/product-card';

/**
 * Saved products.
 *
 * This page is the clearest demonstration of the relationship on the backend:
 * the user document stores only product ObjectIds, and `populate()` on the
 * server turns them into whole products, so one request renders full cards.
 */
@Component({
  selector: 'app-wishlist-page',
  imports: [RouterLink, ProductCard],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
})
export class WishlistPage implements OnInit {
  protected readonly wishlist = inject(WishlistService);

  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.wishlist.load().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  /** Moves every in-stock saved product into the bag in one go. */
  protected addAllToBag(): void {
    const available = this.wishlist.items().filter((p) => p.stock > 0);

    if (available.length === 0) {
      this.toast.error('None of your saved products are in stock right now.');
      return;
    }

    available.forEach((product) => this.cart.add(product));
    this.toast.success(`${available.length} product(s) added to your bag`);
  }

  protected openProduct(product: Product): void {
    void this.router.navigate(['/products', product._id]);
  }
}
