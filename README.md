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
| `npm run build` | Production build of all four apps, bundled into `dist/` |
| `npm run preview` | Build everything and serve exactly what gets deployed, on :5173 |

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

## Deploying

The host is a static site that fetches each remote's `remoteEntry.js` over the
network at runtime, so **the remotes have to be reachable from the browser**, not
from your machine. A build that still points at `http://localhost:5001` renders
the shell fine and then shows "micro frontend unavailable" for every remote.

### One deploy (default)

`npm run build` builds all four apps and copies each remote's output into the
host's, so one static directory serves the whole system:

```
dist/assets/…          the shell
dist/catalog/assets/…  served at /catalog
dist/cart/assets/…     served at /cart
dist/checkout/assets/… served at /checkout
```

The production build points the host at those same-origin subpaths, so the
output is deployable as-is. `vercel.json` wires this up:

| Vercel setting | Value |
| --- | --- |
| Root Directory | `./` (the repository root, **not** `host`) — the remotes live outside `host/`, and Vercel cannot reach outside the Root Directory |
| Build Command | `npm run build` |
| Output Directory | `dist` (the default) |

Run `npm run preview` to check the exact bytes that get deployed before pushing.

### Separate deploys (one project per remote)

The point of the split is that each remote ships on its own schedule. Each
remote carries its own `vercel.json`, so it deploys as a standalone Vercel
project:

| Setting | Value |
| --- | --- |
| Root Directory | `remote-catalog` (or `remote-cart`, `remote-checkout`) |
| Everything else | comes from that remote's `vercel.json` |

Its `vercel.json` does three things that matter:

- **`Access-Control-Allow-Origin: *`** — the host imports `remoteEntry.js`
  cross-origin, and ES module imports are CORS-checked. Without it the shell
  sees a network error and renders its failure panel.
- **`Cache-Control: must-revalidate` on `remoteEntry.js`** — that file carries
  no content hash, so it is the one thing that must never be cached hard. It is
  how a redeployed remote reaches an unchanged host.
- **`ignoreCommand`** — skips the build when nothing in that remote or `shared/`
  changed, so a catalog commit does not redeploy the cart.

Then point the host at them (see `host/.env.example`):

```bash
VITE_REMOTE_CATALOG=https://orbit-catalog.vercel.app
VITE_REMOTE_CART=https://orbit-cart.vercel.app
VITE_REMOTE_CHECKOUT=https://orbit-checkout.vercel.app
```

Any variable that is set wins over the same-origin default, so you can move one
remote out without touching the other two. Only the host is rebuilt — and only
because the URL changed, not because the remote's code did.

Run the whole split topology locally with `npm run preview:split`: four servers
on four origins, exactly as the separate deploys run.

### Shipping a remote without redeploying the host

This is the property the split is *for*, and it is worth confirming rather than
assuming. With `npm run preview:split` running:

1. Change something the catalog renders.
2. Rebuild that remote alone — `npm run build -w remote-catalog`.
3. Hard-reload the host. The change is there.

The host's bundle is byte-identical throughout: it never learned what changed,
only that the same URL now returns a different manifest. Rebuilding the host is
required when a remote's *URL* changes, never when its *contents* do.

### Per-app CI

Each app has its own pipeline in `.github/workflows/`, filtered to its own
directory plus `shared/`:

| Workflow | Runs when |
| --- | --- |
| `remote-catalog.yml` | `remote-catalog/**` or `shared/**` changes |
| `remote-cart.yml` | `remote-cart/**` or `shared/**` changes |
| `remote-checkout.yml` | `remote-checkout/**` or `shared/**` changes |
| `host.yml` | `host/**`, `scripts/**` or `shared/**` changes |

They share one reusable job (`build-app.yml`) that builds a single workspace and
asserts the remote emitted a `remoteEntry.js` — a remote that builds without one
is broken in the only way that matters, because the host has nothing to import.

A commit touching only `remote-catalog/` runs one pipeline. A commit touching
`shared/` runs all four, because every app compiles it in.

## Notes and trade-offs

- **Styling** is one shared stylesheet rather than per-remote CSS. That mirrors
  the common "shared design system package" setup and guarantees the host has
  every class a remote renders. If you want true style isolation, give each
  remote its own CSS and let federation ship it with the exposed module.
- **React is a shared singleton** (`shared: ['react', 'react-dom']`), so hooks
  work across the host/remote boundary. All apps must stay on compatible
  versions.
- **Remote URLs are a deployment decision**, resolved in `host/vite.config.js`:
  localhost ports in dev, same-origin subpaths in a production build, or
  whatever `VITE_REMOTE_<NAME>` says. See [Deploying](#deploying).
- **Ports**: the host uses 5173 because macOS AirPlay Receiver occupies 5000.
