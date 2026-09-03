/** Standalone entry — the cart running on its own at :5002, no host required. */
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { bus, cartStore, EVENTS, mountToaster, products, toast } from '@mfe/shared';
import CartBadge from './CartBadge.jsx';
import CartPage from './CartPage.jsx';
import '@mfe/shared/styles.css';

function Standalone() {
  useEffect(() =>
    bus.on(EVENTS.NAVIGATE, ({ to }) => {
      // No host here to own routing, so just report where it wanted to go.
      toast(`Navigation requested: ${to}`, 'info');
    }),
  []);

  return (
    <div className="shell">
      <div className="standalone-banner">
        <span aria-hidden="true">🧩</span> cart micro frontend · running standalone on :5002
      </div>
      <header className="topbar">
        <span className="brand">
          <span className="brand-mark">C</span> Cart
        </span>
        <span className="spacer" />
        <button className="btn btn-quiet" onClick={() => cartStore.add(products[0])}>
          + Seed an item
        </button>
        <CartBadge />
      </header>
      <main className="page">
        <CartPage />
      </main>
    </div>
  );
}

mountToaster();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Standalone />
  </StrictMode>,
);
