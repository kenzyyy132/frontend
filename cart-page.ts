import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartItem, CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

/**
 * The shopping bag.
 *
 * All the arithmetic (subtotal, shipping, total) is exposed as computed signals
 * on CartService, so this page only renders and forwards user intent.
 */
@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  private readonly products = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly placing = signal(false);

  /** Read from the service so the bar and the rule can never disagree. */
  protected readonly freeShippingAt = CartService.FREE_SHIPPING_AT;

  protected imageUrl(item: CartItem): string {
    return this.products.imageUrl(item.product.image);
  }

  /** How far the bag is from free delivery, as a percentage for the bar. */
  protected progress(): number {
    return Math.min(100, (this.cart.subtotal() / this.freeShippingAt) * 100);
  }

  protected remaining(): number {
    return Math.max(0, this.freeShippingAt - this.cart.subtotal());
  }

  protected setQuantity(productId: string, value: number): void {
    this.cart.setQuantity(productId, value);
  }

  protected remove(item: CartItem): void {
    this.cart.remove(item.product._id);
    this.toast.show(`${item.product.name} removed from your bag`);
  }

  protected clear(): void {
    this.cart.clear();
    this.toast.show('Your bag is now empty');
  }

  /**
   * The backend has no orders endpoint, so checkout is simulated. The guard on
   * the real flow would be the same: you must be signed in.
   */
  protected checkout(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.error('Please sign in to complete your order.');
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }

    this.placing.set(true);

    setTimeout(() => {
      this.placing.set(false);
      this.cart.clear();
      this.toast.success('Order placed. Thank you for shopping with LUMORA ✦');
      void this.router.navigateByUrl('/products');
    }, 1200);
  }
}
