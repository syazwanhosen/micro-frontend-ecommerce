/**
 * Cart store shared by every micro frontend.
 *
 * Each micro frontend bundles its own copy of this file, so the instance is
 * pinned to `window` — whoever runs first creates it, everyone else reuses it.
 * That keeps a single source of truth without a backend and without coupling
 * the remotes to the host's React tree.
 *
 * Listeners receive an immutable snapshot: { items, promo }.
 */
const ITEMS_KEY = 'mfe-shop-cart-v1';
const PROMO_KEY = 'mfe-shop-promo-v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be unavailable (private mode) — the cart still works in memory */
  }
}

function createCartStore() {
  let items = read(ITEMS_KEY, []);
  let promo = read(PROMO_KEY, null);
  let snapshot = { items, promo };
  const listeners = new Set();

  const commit = () => {
    write(ITEMS_KEY, items);
    write(PROMO_KEY, promo);
    snapshot = { items, promo };
    listeners.forEach((fn) => fn(snapshot));
  };

  const store = {
    /** Stable snapshot — safe to use directly as React state. */
    getSnapshot: () => snapshot,
    getItems: () => items,
    getPromo: () => promo,

    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },

    add(product, qty = 1) {
      const existing = items.find((i) => i.id === product.id);
      if (existing) {
        items = items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      } else {
        const { id, name, price, emoji, tint, category } = product;
        items = [...items, { id, name, price, emoji, tint, category, qty }];
      }
      commit();
    },

    setQty(id, qty) {
      if (qty <= 0) {
        store.remove(id);
        return;
      }
      items = items.map((i) => (i.id === id ? { ...i, qty } : i));
      commit();
    },

    remove(id) {
      items = items.filter((i) => i.id !== id);
      commit();
    },

    setPromo(code) {
      promo = code;
      commit();
    },

    clear() {
      items = [];
      promo = null;
      commit();
    },

    count() {
      return items.reduce((n, i) => n + i.qty, 0);
    },
  };

  return store;
}

export const cartStore = (window.__MFE_CART_STORE__ ||= createCartStore());
