import { Routes } from '@angular/router';

import { AdminLayout } from './admin-layout/admin-layout';

/**
 * Child routes for the admin area.
 *
 * The parent route in app.routes.ts already applied authGuard + adminGuard, so
 * nothing in this file is reachable without an admin token. AdminLayout renders
 * the sidebar and a nested <router-outlet> that these children fill.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'dashboard',
        title: 'Dashboard — LUMORA Admin',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        // The literal "new" route MUST come first. Angular matches routes in
        // order with prefix matching, so a bare `products` route declared above
        // would swallow the first segment of /products/new.
        path: 'products/new',
        title: 'New product — LUMORA Admin',
        loadComponent: () => import('./product-form/product-form').then((m) => m.ProductForm),
      },
      {
        // pathMatch: 'full' so this only ever matches /admin/products exactly.
        path: 'products',
        pathMatch: 'full',
        title: 'Products — LUMORA Admin',
        loadComponent: () => import('./product-table/product-table').then((m) => m.ProductTable),
      },
      {
        path: 'products/:id/edit',
        title: 'Edit product — LUMORA Admin',
        loadComponent: () => import('./product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'users',
        title: 'Customers — LUMORA Admin',
        loadComponent: () => import('./users/users').then((m) => m.Users),
      },
    ],
  },
];
