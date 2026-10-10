import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';

/**
 * My profile — a reactive form with a nested group for the address, plus an
 * optional avatar upload.
 *
 * When a file is chosen the payload is sent as FormData so multer handles it;
 * otherwise a plain JSON object goes out. Both are accepted by PUT /users/me.
 */
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);

  private readonly fb = inject(FormBuilder);
  private readonly products = inject(ProductService);
  private readonly toast = inject(ToastService);

  protected readonly saving = signal(false);
  protected readonly avatarFile = signal<File | null>(null);
  protected readonly avatarPreview = signal<string>('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.minLength(6)]],
    address: this.fb.nonNullable.group({
      street: [''],
      city: [''],
      country: [''],
      postalCode: [''],
    }),
  });

  constructor() {
    const user = this.auth.user();

    if (user) {
      this.form.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        address: {
          street: user.address?.street ?? '',
          city: user.address?.city ?? '',
          country: user.address?.country ?? '',
          postalCode: user.address?.postalCode ?? '',
        },
      });
    }
  }

  protected get name() {
    return this.form.controls.name;
  }

  protected get email() {
    return this.form.controls.email;
  }

  protected get password() {
    return this.form.controls.password;
  }

  protected avatarUrl(): string {
    return this.avatarPreview() || this.products.imageUrl(this.auth.user()?.image);
  }

  protected onAvatarPicked(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Mirror the backend limits so the user is told before the upload fails.
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type)) {
      this.toast.error('Please choose a jpg, png or webp image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('That image is larger than 5MB.');
      return;
    }

    this.avatarFile.set(file);
    this.avatarPreview.set(URL.createObjectURL(file));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);

    // A file means multipart; otherwise plain JSON keeps the request simple.
    let payload: FormData | Record<string, unknown>;

    if (this.avatarFile()) {
      const data = new FormData();
      data.append('name', value.name);
      data.append('email', value.email);
      data.append('phone', value.phone);
      if (value.password) data.append('password', value.password);
      data.append('address[street]', value.address.street);
      data.append('address[city]', value.address.city);
      data.append('address[country]', value.address.country);
      data.append('address[postalCode]', value.address.postalCode);
      data.append('image', this.avatarFile() as File);
      payload = data;
    } else {
      payload = {
        name: value.name,
        email: value.email,
        phone: value.phone,
        address: value.address,
        ...(value.password ? { password: value.password } : {}),
      };
    }

    this.auth.updateProfile(payload as never).subscribe({
      next: () => {
        this.saving.set(false);
        this.password.reset('');
        this.avatarFile.set(null);
        this.toast.success('Profile updated ✦');
      },
      error: () => this.saving.set(false),
    });
  }

  protected signOut(): void {
    this.wishlist.clear();
    this.auth.logout('/');
  }
}
