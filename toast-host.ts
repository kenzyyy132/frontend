import { Component, inject } from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';

/**
 * Renders the notification stack. Mounted once in the root component so any
 * service can raise a message from anywhere without passing anything down.
 */
@Component({
  selector: 'app-toast-host',
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss',
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
