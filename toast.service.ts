import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  show(text: string, kind: ToastKind = 'info', ms = 3500): void {
    const id = this.nextId++;

    this._toasts.update((list) => [...list, { id, kind, text }]);

    setTimeout(() => this.dismiss(id), ms);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error', 5000);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
