import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { ToastService } from '../../core/services/toast.service';
import { RevealDirective } from '../../shared/reveal.directive';

/** The shape bound by ngModel. */
interface ContactModel {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic: string;
  newsletter: boolean;
}

/**
 * Contact us — built with a TEMPLATE-DRIVEN form.
 *
 * This is the case template-driven forms are made for: a handful of simple
 * fields, validation expressible with plain HTML attributes, and no logic that
 * needs to reach into the control tree. `[(ngModel)]` gives the two-way binding
 * and `#ref="ngModel"` exposes validity to the template.
 *
 * (Login uses reactive forms and register uses signal forms, so the project
 * shows all three approaches from the course.)
 */
@Component({
  selector: 'app-contact',
  imports: [FormsModule, RevealDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly toast = inject(ToastService);

  protected readonly sending = signal(false);
  protected readonly sent = signal(false);

  protected readonly topics = ['Order enquiry', 'Product advice', 'Returns', 'Partnership', 'Other'];

  /** Two-way bound straight to the inputs. */
  protected model: ContactModel = {
    name: '',
    email: '',
    subject: '',
    message: '',
    topic: 'Order enquiry',
    newsletter: false,
  };

  protected readonly channels = [
    { icon: '✉', label: 'Email', value: 'hello@lumora.test' },
    { icon: '☎', label: 'Phone', value: '+20 100 000 0000' },
    { icon: '⌂', label: 'Studio', value: '14 Rose Court, Cairo' },
    { icon: '⏱', label: 'Hours', value: 'Sun–Thu, 10:00–18:00' },
  ];

  /**
   * There is no messages endpoint on the backend, so this is a local
   * submission: it validates, shows the success state, and resets.
   */
  protected submit(form: NgForm): void {
    if (form.invalid) {
      // Touch every control so all the errors appear together.
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      this.toast.error('Please fix the highlighted fields.');
      return;
    }

    this.sending.set(true);

    setTimeout(() => {
      this.sending.set(false);
      this.sent.set(true);
      this.toast.success('Thanks! We will reply within one working day ✦');
      form.resetForm({ topic: 'Order enquiry', newsletter: false });
    }, 900);
  }

  protected writeAnother(): void {
    this.sent.set(false);
  }
}
