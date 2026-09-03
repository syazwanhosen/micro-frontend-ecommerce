/** Standalone entry — checkout running on its own at :5003, no host required. */
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { bus, cartStore, EVENTS, mountToaster, products, toast } from '@mfe/shared';
import CheckoutPage from './CheckoutPage.jsx';
import '@mfe/shared/styles.css';

function Standalone() {
  useEffect(() =>
    bus.on(EVENTS.NAVIGATE, ({ to }) => {
      toast(`Navigation requested: ${to}`, 'info');
    }),
  []);

  return (
    <div className="shell">
      <div className="standalone-banner">
        <span aria-hidden="true">🧩</span> checkout micro frontend · running standalone on :5003
      </div>
      <header className="topbar">
        <span className="brand">
          <span className="brand-mark">C</span> Checkout
        </span>
        <span className="spacer" />
        <button className="btn btn-quiet" onClick={() => cartStore.add(products[3])}>
          + Seed an item
        </button>
      </header>
      <main className="page">
        <CheckoutPage />
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
