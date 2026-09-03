# Orbit Store — a micro frontend e-commerce demo

Four independently built and independently deployable frontend apps that render
as one store. **No API, no backend, no database** — the catalog is a static
module and the cart lives in `localStorage`.

Composition is done with **Vite + Module Federation**
(`@originjs/vite-plugin-federation`), the same mechanism Webpack 5 popularised.

```
                    ┌──────────────────────────┐
                    │   host (shell) :5173     │
                    │  header · routing · toasts│
                    └────────────┬─────────────┘
                 loads remoteEntry.js at runtime
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌────────────────┐      ┌────────────────┐      ┌──────────────────┐
│ catalog :5001  │      │  cart :5002    │      │  checkout :5003  │
│ ProductGrid    │      │  CartBadge     │      │  CheckoutPage    │
│ ProductDetail  │      │  CartPage      │      │                  │
└────────────────┘      └────────────────┘      └──────────────────┘
        └────────────────────────┼────────────────────────┘
                     ┌───────────▼────────────┐
                     │  @mfe/shared           │
                     │  cart store · bus      │
                     │  products · design CSS │
                     └────────────────────────┘
```

## Run it

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**.

`npm run dev` builds the three remotes, serves each on its own port, and starts
the host dev server. Remotes must be *built* (not `vite dev`) for federation to
expose a `remoteEntry.js` — that is a constraint of the Vite federation plugin.

| Script | What it does |
| --- | --- |
| `npm run dev` | Build remotes once, serve everything, host in dev mode |
| `npm run watch` | Same, but remotes rebuild on change (refresh the page to pick them up) |
| `npm run build` | Production build of all four apps |
| `npm run preview` | Build everything and serve the production output |

> **After changing a remote**, rebuild it (`npm run build -w remote-cart`) and
> **hard-reload** the host. `remoteEntry.js` has no content hash, so a normal
> reload can serve you a cached manifest pointing at the previous chunks.

## Each remote also runs on its own

That is the point of the split — open any of these with no host running:

- http://localhost:5001 — catalog, with its own mini shell
- http://localhost:5002 — cart, with a "seed an item" button
- http://localhost:5003 — checkout

Each shows a banner telling you it is running standalone.

## What each app owns

| App | Port | Owns | Exposes |
| --- | --- | --- | --- |
| `host` | 5173 | Header, nav, hash routing, toast rendering, error boundaries | — |
| `remote-catalog` | 5001 | Product grid, search, filters, sort, product detail | `./ProductGrid`, `./ProductDetail` |
| `remote-cart` | 5002 | Cart badge, line items, quantities, promo codes | `./CartBadge`, `./CartPage` |
| `remote-checkout` | 5003 | Three-step checkout, validation, confirmation | `./CheckoutPage` |
| `shared` | — | Cart store, event bus, catalog data, pricing math, design system CSS | (plain workspace package) |

## How the pieces talk

Three rules keep the remotes genuinely independent — no remote imports the host,
and no remote imports another remote.

**1. Shared state via a `window` singleton.**
Every micro frontend bundles its own copy of `shared/src/store.js`, but the
store instance is pinned to `window.__MFE_CART_STORE__`. Whoever loads first
creates it; everyone else reuses it. Add to cart from the catalog and the cart
badge in the host's header updates immediately. It persists to `localStorage`,
so a refresh keeps the cart.

**2. Navigation via an event bus.**
Remotes never import a router. They call `navigate('#/cart')`, which emits an
event on `window.__MFE_BUS__`. The host listens and owns the URL. Running
standalone, the remote handles the event itself.

**3. Pricing math in one place.**
`computeTotals()` in `shared/src/totals.js` is the only place subtotal,
discount, shipping and tax are calculated, so the cart page and the checkout
page can never disagree about the total.

## Failure isolation

Every federated component is mounted behind its own error boundary and its own
`<Suspense>`. Stop the catalog remote and the shell, header, cart badge and cart
page all keep working — the catalog area alone shows a "micro frontend
unavailable" panel with a retry.

Try it: kill the process on :5001, then hard-reload the host.

Click **🧩 MFE map** in the header to watch remotes load on demand, with their
live status and ports.

## Things to try

- Add items from the grid — the header badge updates across app boundaries.
- Promo code `MFE10` (10% off) or `SHOP20` (20% off) on the cart page.
- Free shipping kicks in over $300.
- Checkout is a demo form: it validates, then clears the cart and shows a
  locally generated order number. Nothing is submitted anywhere.

## Notes and trade-offs

- **Styling** is one shared stylesheet rather than per-remote CSS. That mirrors
  the common "shared design system package" setup and guarantees the host has
  every class a remote renders. If you want true style isolation, give each
  remote its own CSS and let federation ship it with the exposed module.
- **React is a shared singleton** (`shared: ['react', 'react-dom']`), so hooks
  work across the host/remote boundary. All apps must stay on compatible
  versions.
- **Remote URLs are hardcoded** to localhost in `host/vite.config.js`. In a real
  deployment these become per-environment URLs, and each remote ships on its own
  schedule without rebuilding the host.
- **Ports**: the host uses 5173 because macOS AirPlay Receiver occupies 5000.
