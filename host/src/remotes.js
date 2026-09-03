import { lazy } from 'react';

/**
 * The host's map of the system. It knows three names and three URLs — nothing
 * about how any remote is built or what is inside it.
 */
export const REMOTES = {
  catalog: { port: 5001, exposes: ['ProductGrid', 'ProductDetail'] },
  cart: { port: 5002, exposes: ['CartBadge', 'CartPage'] },
  checkout: { port: 5003, exposes: ['CheckoutPage'] },
};

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
