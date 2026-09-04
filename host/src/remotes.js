import { lazy } from 'react';

/** Origins baked in at build time by vite.config.js — one per remote. */
const ORIGINS = __REMOTE_ORIGINS__;

/**
 * The host's map of the system. It knows three names and three URLs — nothing
 * about how any remote is built or what is inside it.
 */
export const REMOTES = {
  catalog: { origin: ORIGINS.catalog, exposes: ['ProductGrid', 'ProductDetail'] },
  cart: { origin: ORIGINS.cart, exposes: ['CartBadge', 'CartPage'] },
  checkout: { origin: ORIGINS.checkout, exposes: ['CheckoutPage'] },
};

/** A short, honest label for an origin: ":5001" locally, "/catalog" or a host name once deployed. */
export function endpointLabel(origin) {
  if (!/^https?:\/\//.test(origin)) return origin;
  const { hostname, port, host } = new URL(origin);
  return port && (hostname === 'localhost' || hostname === '127.0.0.1') ? `:${port}` : host;
}

/** Where the shell itself is served from. */
export const HOST_LABEL = import.meta.env.DEV ? ':5173' : window.location.host;

const status = Object.fromEntries(Object.keys(REMOTES).map((name) => [name, 'idle']));
const listeners = new Set();

function setStatus(name, value) {
  status[name] = value;
  const snapshot = { ...status };
  listeners.forEach((fn) => fn(snapshot));
}

export const remoteStatus = {
  get: () => ({ ...status }),
  subscribe(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

/** Wraps a federated import so the inspector can show what loaded and what did not. */
function remote(name, loader) {
  return lazy(() => {
    setStatus(name, 'loading');
    return loader().then(
      (module) => {
        setStatus(name, 'ready');
        return module;
      },
      (error) => {
        setStatus(name, 'error');
        throw error;
      },
    );
  });
}

export const ProductGrid = remote('catalog', () => import('catalog/ProductGrid'));
export const ProductDetail = remote('catalog', () => import('catalog/ProductDetail'));
export const CartBadge = remote('cart', () => import('cart/CartBadge'));
export const CartPage = remote('cart', () => import('cart/CartPage'));
export const CheckoutPage = remote('checkout', () => import('checkout/CheckoutPage'));
