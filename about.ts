import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { RevealDirective } from '../../shared/reveal.directive';

/**
 * Our Story — the brand page linked from the navbar and the footer.
 */
@Component({
  selector: 'app-about',
  imports: [RouterLink, RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  private readonly router = inject(Router);

  /** Which milestone the timeline is highlighting. */
  protected readonly activeYear = signal(2026);

  protected readonly milestones = [
    {
      year: 2019,
      title: 'A kitchen in Heliopolis',
      text: 'We started blending rose water and black seed oil for friends who could not find gentle formulas that suited Egyptian skin and Egyptian weather.',
    },
    {
      year: 2021,
      title: 'Our first partners',
      text: 'We began working directly with Egyptian makers — Harraz in old Cairo, Imtenan in the Delta — instead of importing what everyone else was selling.',
    },
    {
      year: 2023,
      title: 'Dermatologist tested',
      text: 'Every formula we carry went through patch testing on sensitive and reactive skin before it earned a place on the shelf.',
    },
    {
      year: 2026,
      title: 'Nationwide delivery',
      text: 'From one kitchen table to every governorate, with free delivery over EGP 1,000 and returns that actually work.',
    },
  ];

  protected readonly values = [
    {
      icon: '🌱',
      title: 'Vegan, always',
      text: 'No animal-derived ingredients and no animal testing, anywhere in our supply chain.',
    },
    {
      // Not the 🇪🇬 flag emoji: Windows does not render regional-indicator
      // flags and shows the bare letters "EG" instead.
      icon: '🏛️',
      title: 'Made in Egypt',
      text: 'We buy from Egyptian growers and Egyptian makers first. Every brand we carry is produced here.',
    },
    {
      icon: '🔬',
      title: 'Tested properly',
      text: 'Dermatologist tested on sensitive skin, with the full ingredient list printed on every box.',
    },
    {
      icon: '♻️',
      title: 'Less waste',
      text: 'Refillable glass, recycled cartons, and no plastic wrap on anything we ship.',
    },
  ];

  protected readonly makers = [
    { name: 'Eva Cosmetics', since: 'Since 1919', note: 'Cairo' },
    { name: 'Nefertari', since: 'Natural body care', note: 'Luxor' },
    { name: 'Harraz', since: 'Herbalist since 1885', note: 'Old Cairo' },
    { name: 'Imtenan', since: 'Cold-pressed oils', note: 'Delta' },
    { name: 'Sekem', since: 'Biodynamic farms', note: 'Sharqia' },
    { name: 'Amoun', since: 'Dermatology range', note: 'Cairo' },
  ];

  protected setYear(year: number): void {
    this.activeYear.set(year);
  }

  /** Router service navigation, built from a runtime value. */
  protected shopCategory(slug: string): void {
    void this.router.navigate(['/products'], { queryParams: { category: slug } });
  }
}
