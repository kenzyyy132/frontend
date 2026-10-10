import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="nf">
      <span class="blob nf__blob" aria-hidden="true"></span>
      <div class="container nf__inner">
        <p class="nf__code">404</p>
        <h1>This page slipped away</h1>
        <p class="nf__text">
          The link may be old, or the page may have been moved. Let's get you
          back to the good stuff.
        </p>
        <div class="nf__cta">
          <a class="btn btn-primary" routerLink="/">Back home</a>
          <a class="btn btn-ghost" routerLink="/products">Browse the shop</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .nf {
      position: relative;
      overflow: hidden;
      display: grid;
      place-items: center;
      min-height: 100dvh;
      background: var(--grad-hero), var(--cream);
      text-align: center;
    }

    .nf__blob {
      width: 420px;
      height: 420px;
      background: var(--pink-300);
      top: -120px;
      inset-inline-start: -120px;
    }

    .nf__inner {
      position: relative;
      z-index: 1;
      display: grid;
      justify-items: center;
      gap: 14px;
      animation: fade-up var(--t-slow) var(--ease-out) both;
    }

    .nf__code {
      font-family: var(--font-display);
      font-size: clamp(5rem, 20vw, 11rem);
      font-weight: 900;
      line-height: 0.9;
      background: var(--grad-brand);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .nf__text {
      max-width: 42ch;
      color: var(--ink-700);
    }

    .nf__cta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 8px;
    }
  `,
})
export class NotFound {}
