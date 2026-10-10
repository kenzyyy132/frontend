import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';

const THEME_KEY = 'lumora.theme';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  private readonly _preference = signal<ThemePreference>(
    this.storage.get<ThemePreference>(THEME_KEY, 'system'),
  );

  private readonly systemDark = signal(false);

  readonly preference = this._preference.asReadonly();

  readonly isDark = computed(() =>
    this._preference() === 'system' ? this.systemDark() : this._preference() === 'dark',
  );

  readonly label = computed(() => {
    switch (this._preference()) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  });

  constructor() {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');

    if (query) {
      this.systemDark.set(query.matches);
      query.addEventListener('change', (e) => this.systemDark.set(e.matches));
    }

    effect(() => {
      const preference = this._preference();
      const root = document.documentElement;

      if (preference === 'system') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', preference);
      }

      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', this.isDark() ? '#17101a' : '#9a5fc4');

      this.storage.set(THEME_KEY, preference);
    });
  }

  set(preference: ThemePreference): void {
    this._preference.set(preference);
  }

  cycle(): void {
    this._preference.update((current) =>
      current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light',
    );
  }
}
