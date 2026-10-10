import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { Product } from '../models/product.model';
import { StorageService } from './storage.service';

const CART_KEY = 'lumora.cart';

export interface CartItem {
  product: Product;
  quantity: number;
}


@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storage = inject(StorageService);

  private readonly _items = signal<CartItem[]>(this.storage.get<CartItem[]>(CART_KEY, []));

  readonly items = this._items.asReadonly();

  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));

  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );

  static readonly FREE_SHIPPING_AT = 1000;
  static readonly SHIPPING_COST = 60;

  readonly shipping = computed(() => {
    const subtotal = this.subtotal();
    if (subtotal === 0 || subtotal >= CartService.FREE_SHIPPING_AT) return 0;
    return CartService.SHIPPING_COST;
  });

  readonly total = computed(() => this.subtotal() + this.shipping());

  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
   
    effect(() => this.storage.set(CART_KEY, this._items()));
  }


  add(product: Product, quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.product._id === product._id);

      if (!existing) {
        return [...items, { product, quantity }];
      }

      return items.map((i) =>
        i.product._id === product._id
          ?
            { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
          : i,
      );
    });
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this._items.update((items) =>
      items.map((i) =>
        i.product._id === productId
          ? { ...i, quantity: Math.min(quantity, i.product.stock) }
          : i,
      ),
    );
  }

  remove(productId: string): void {
    this._items.update((items) => items.filter((i) => i.product._id !== productId));
  }

  clear(): void {
    this._items.set([]);
  }

  has(productId: string): boolean {
    return this._items().some((i) => i.product._id === productId);
  }
}
