# LUMORA — Frontend (Angular 22)

The storefront and admin dashboard for the LUMORA beauty shop. It talks to the
Express + MongoDB Atlas API in [`../backend`](../backend).

---

## 1. Technologies

| Package | Purpose |
| ------- | ------- |
| `@angular/core` 22 | Components, signals, control flow |
| `@angular/router` | Routing, route params, child routes, guards |
| `@angular/common/http` | HttpClient + functional interceptors |
| `@angular/forms` | Reactive **and** template-driven forms |
| `@angular/forms/signals` | Signal forms (`form()`, `FormField`, `FormRoot`) |
| SCSS | Design tokens, animations, shared components |

No UI framework and no CSS library — the whole look is hand-written CSS, so every
line is explainable.

---

## 2. Running it

The backend must be running first.

```bash
# terminal 1
cd backend
npm install
npm run seed      # once, to load the sample catalogue
npm run dev       # http://localhost:5000

# terminal 2
cd frontend
npm install
npm start         # http://localhost:4200
```

Open <http://localhost:4200>.

### Test accounts

| Role | Email | Password |
| ---- | ----- | -------- |
| admin | `admin@belleza.test` | `Admin@123` |
| user | `customer@belleza.test` | `User@123` |

The login page has **Admin** and **Customer** buttons that fill these in.

### Pointing at a different API

Everything resolves its URL from `src/environments/environment.ts`:

```ts
export const environment = {
  apiBaseUrl: 'http://localhost:5000/api/v1',  // API calls
  apiOrigin: 'http://localhost:5000',          // uploaded images
};
```

---

## 3. Folder structure

```
src/
├── environments/                environment.ts / environment.prod.ts
├── styles/
│   ├── _tokens.scss             colours, radii, shadows, motion, fonts
│   ├── _base.scss               reset and element defaults
│   ├── _animations.scss         keyframes + motion utilities
│   └── _components.scss         buttons, cards, fields, badges, tables
└── app/
    ├── core/
    │   ├── models/              api, product, user types
    │   ├── services/            auth, product, cart, wishlist, toast, storage
    │   ├── interceptors/        auth.interceptor, error.interceptor
    │   └── guards/              authGuard, adminGuard, guestGuard
    ├── layout/                  navbar, footer, main-layout
    ├── shared/
    │   ├── reveal.directive.ts  scroll-into-view animation
    │   └── components/          product-card, toast-host
    └── features/
        ├── home/
        ├── products/            product-list, product-detail
        ├── cart/  wishlist/  profile/  contact/  not-found/
        ├── auth/                login, register
        └── admin/               admin.routes + layout, dashboard,
                                 product-table, product-form, users
```

---

## 4. Where each course topic lives

| Topic | Where to find it |
| ----- | ---------------- |
| **Components** | 20 components under `features/`, `layout/`, `shared/` |
| **Data binding** | Interpolation, property `[src]`, event `(click)`, two-way `[(ngModel)]` — `contact.html` uses all four |
| **Control flow** | `@if` / `@else`, `@for` + `track`, `@empty`, `@switch` — `product-card.html` uses all of them |
| **Signals** | `signal()`, `computed()`, `effect()`, `input()`, `asReadonly()` — `cart.service.ts`, `product-list.ts` |
| **Template-driven form** | `features/contact/` |
| **Reactive form** | `features/auth/login/`, `features/profile/`, `features/admin/product-form/` |
| **Signal form** | `features/auth/register/` |
| **HttpClient** | every file in `core/services/` |
| **Interceptors** | `core/interceptors/auth.interceptor.ts` + `error.interceptor.ts` |
| **Services** | `core/services/` — six, all `providedIn: 'root'` |
| **Define routes** | `app.routes.ts` |
| **routerLink** | navbar, footer, product cards, breadcrumbs |
| **Router.navigate / navigateByUrl** | `navbar.ts` (search), `home.ts` (category), `login.ts` (returnUrl) |
| **Route parameters** | `products/:id` → `product-detail.ts`; `admin/products/:id/edit` → `product-form.ts` |
| **Child routes** | `admin/admin.routes.ts` rendering into `admin-layout`'s nested outlet |
| **Route guards** | `core/guards/auth.guard.ts` — three guards, applied in `app.routes.ts` |

---

## 5. How the pieces fit together

### Authentication flow

1. Login or register posts to the API and receives `{ token, data: user }`.
2. `AuthService` stores both in signals **and** localStorage, so a refresh keeps
   you signed in.
3. `authInterceptor` attaches `Authorization: Bearer <token>` to every request
   aimed at our own API — no component ever builds that header.
4. On start-up `App.ngOnInit` calls `GET /auth/me` to confirm the stored token is
   still valid (it may have expired, or the account may have been deactivated).
5. `errorInterceptor` catches a 401, clears the session and redirects to
   `/login?returnUrl=…`.

### Guards

| Guard | Protects | On failure |
| ----- | -------- | ---------- |
| `authGuard` | `/profile`, `/wishlist`, `/admin` | → `/login?returnUrl=…` |
| `adminGuard` | `/admin` (after authGuard) | → `/` with a toast |
| `guestGuard` | `/login`, `/register` | → `/` when already signed in |

Each returns a `UrlTree` rather than calling `navigate()`, so the router cancels
and redirects in one step and the protected page never flashes on screen.

> The server enforces the same rules independently. A tampered client still gets
> a `403` from the API — the guards only keep the UI honest.

### State

| Service | Holds | Persisted |
| ------- | ----- | --------- |
| `AuthService` | token + user, `isLoggedIn`, `isAdmin` | localStorage |
| `CartService` | bag lines, `count`, `subtotal`, `shipping`, `total` | localStorage via an `effect()` |
| `WishlistService` | saved products | the server (a real relationship) |
| `ToastService` | notification stack | — |

### The wishlist relationship

The user document on the backend stores an array of product `ObjectId`s with
`ref: 'Product'`. `GET /users/me/wishlist` uses Mongoose's `populate()` to return
whole product documents instead of ids, which is why `/wishlist` renders full
cards from a single request. `GET /products/:id` likewise populates `createdBy`,
shown in the product detail tabs as "Added by".

### Images

`ProductService.imageUrl()` turns the stored `/uploads/x.png` path into a full
URL against `environment.apiOrigin`. Uploads are sent as `FormData` under the
field name **`image`**; when no file is picked the request goes out as plain JSON
instead, so nothing is uploaded when nothing changed.

`Content-Type` is never set by hand for `FormData` — the browser adds the
multipart boundary itself.

---

## 6. Pages

| Route | Access | What it does |
| ----- | ------ | ------------ |
| `/` | public | Hero, categories, two product rails, offers |
| `/products` | public | Catalogue: search, category, brand, stock, sort, paging |
| `/products/:id` | public | Gallery, quantity, add to bag, tabs, related products |
| `/cart` | public | Bag lines, quantities, free-delivery progress, totals |
| `/wishlist` | signed in | Saved products (populated from the server) |
| `/profile` | signed in | Account form with nested address group + avatar upload |
| `/about` | public | Our Story — values, timeline, Egyptian makers |
| `/contact` | public | Template-driven contact form |
| `/login` `/register` | guests | Reactive form / signal form |
| `/admin/dashboard` | admin | KPIs, category chart, low-stock alerts |
| `/admin/products` | admin | Table with search, filter, inline delete confirmation |
| `/admin/products/new` | admin | Create, with image upload |
| `/admin/products/:id/edit` | admin | Edit, optionally replacing the image |
| `/admin/users` | admin | Promote/demote roles, delete accounts |
| `**` | public | 404 page |

Catalogue filter state lives in the query string, so a filtered view is
shareable, survives a refresh, and the browser back button behaves.

---

## 7. Design, theming and motion

The palette runs from soft pink to deep orchid, defined once in `_tokens.scss`.

### Light / dark mode

The navbar button cycles **light → dark → system**. "System" is a real third
choice, not an absence of one: it removes `data-theme` from `<html>` and lets
the `prefers-color-scheme` block decide, so the page keeps following the OS.

* `ThemeService` owns the preference as a signal and writes it to localStorage.
* A tiny inline script in `index.html` applies the saved theme **before** Angular
  boots, so there is no flash of the light palette on load.
* Only the semantic tokens are redefined for dark. The brand ramp
  (`--orchid-*`, `--pink-*`) moves to its light end because those values are used
  as **text** in most components; anything that uses them as a **background**
  under white text (the admin sidebar, the coloured offer panel, buttons) reads
  from `--sidebar-bg`, `--offer-bg` and `--grad-brand`, which stay dark in both
  themes.
* Frosted surfaces use `--glass` rather than a hardcoded white, which would
  otherwise stay white in dark mode and swallow its own text.
* Product images are transparent SVGs, so they pick up whatever the card behind
  them is.

Motion is built from a small shared vocabulary in `_animations.scss`:

- **Entrances** — `fade-up`, `slide-in-left/right`, `pop-in`
- **Ambient** — `float-y`, `float-3d`, `blob-morph`, `spin-slow`, `gradient-pan`
- **Effects** — `sheen` (button and skeleton sweeps), `marquee` (ribbons),
  `pulse-ring`

Route changes cross-fade through the browser's **View Transitions API**
(`withViewTransitions()` in `app.config.ts`); browsers without it just navigate
as before.

3D touches: the hero bottle is pure CSS (`transform-style: preserve-3d` with
layered inset shadows for the glass), product cards tilt on hover via
`rotateX/rotateY`, and blurred blobs drift behind most sections.

`appReveal` plays an entrance when an element scrolls into view, using
`IntersectionObserver` so the work stays off the main thread.

All of it is switched off in one place when the visitor has
`prefers-reduced-motion: reduce` set. The layout is responsive down to 390px
with no horizontal overflow.

---

## 8. Build

```bash
npm run build      # production bundle into dist/frontend
```

The app is lazy-loaded route by route: the first bundle is the shell plus the
home page (~93 kB transferred), and the catalogue, auth pages and the entire
admin area arrive as separate chunks on demand.

---

## 9. The catalogue

48 products from 14 real Egyptian brands, priced in EGP for the Egyptian market
(65 – 1,250 EGP). Free delivery kicks in at EGP 1,000.

| Kind | Brands |
| ---- | ------ |
| Skincare & pharmacy | Eva Cosmetics, Shaan, Amoun |
| Bath & body | Bubblzz, Nefertari, Imtenan |
| Makeup | Caroline Beauty, Dorella, Karmel Beauty, Grazel, Glaze by KG, Mala Beauty |
| Herbal & fragrance | Harraz, Sekem |

The product images are **generated**, not downloaded: `backend/seed/generate-images.js`
draws an SVG per product, picking a shape from its category and a colour from
its name, so the catalogue ships with real artwork and no licensing questions.
Regenerate them any time with:

```bash
cd backend
node seed/generate-images.js   # writes uploads/ + image paths into seed/products.json
npm run seed
```

> The catalogue is sample data for this student project. The brands are real
> Egyptian companies, but the specific products, prices and stock levels are
> illustrative.

---

## 10. Testing that was run

- **38 integration checks** against the live API from the browser's origin —
  CORS preflight, auth, guards, wishlist populate, multipart upload, image
  serving, validation errors.
- **55 browser render checks** in headless Chrome — every page, both layouts,
  all three form types, guard redirects, filters writing to the URL, the mobile
  breakpoint, and a console free of runtime errors.
- **43 checks** on the Egyptian catalogue, the generated images, the Our Story
  page and light/dark mode, including contrast readings taken from the rendered
  page in both themes.
- **29 regression checks** after the theming work, covering the guards, all
  three form types, the admin area in both themes, and the cart.
