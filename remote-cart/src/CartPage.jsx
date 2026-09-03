import { useState } from 'react';
import { cartStore, navigate, PROMO_CODES, toast } from '@mfe/shared';
import { useCart } from './useCart.js';
import CartLine from './CartLine.jsx';
import OrderSummary from './OrderSummary.jsx';

export default function CartPage() {
  const { items, promo } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const applyPromo = (event) => {
    event.preventDefault();
    const entered = code.trim().toUpperCase();
    if (!PROMO_CODES[entered]) {
      setError('That code is not valid.');
      return;
    }
    setError('');
    setCode('');
    cartStore.setPromo(entered);
    toast(`${PROMO_CODES[entered].label} applied`, 'success');
  };

  if (items.length === 0) {
    return (
      <div className="empty">
        <span className="empty-glyph" aria-hidden="true">🛒</span>
        <h2>Your cart is empty</h2>
        <p className="small">Everything you add stays here, even after a refresh.</p>
        <button className="btn" onClick={() => navigate('#/')}>
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <section className="stack">
      <div className="row-between">
        <div>
          <h1>Your cart</h1>
          <p className="muted small" style={{ marginTop: 4 }}>
            Served by the <strong>cart</strong> micro frontend.
          </p>
        </div>
        <button className="btn btn-quiet" onClick={() => cartStore.clear()}>
          Clear cart
        </button>
      </div>

      <div className="cart-layout">
        <div className="stack">
          <div className="panel">
            {items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </div>

          <form className="panel panel-pad" onSubmit={applyPromo}>
            <div className="field">
              <label htmlFor="promo">Promo code</label>
              <div className="row">
                <input
                  id="promo"
                  value={code}
                  placeholder="Try MFE10"
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError('');
                  }}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-ghost" type="submit">
                  Apply
                </button>
              </div>
              {error && <span className="error">{error}</span>}
              {promo && (
                <span className="small" style={{ color: 'var(--accent)' }}>
                  {promo} applied — {PROMO_CODES[promo].label}.{' '}
                  <button className="btn btn-quiet tiny" type="button" onClick={() => cartStore.setPromo(null)}>
                    Remove
                  </button>
                </span>
              )}
            </div>
          </form>
        </div>

        <OrderSummary items={items} promo={promo}>
          <button className="btn btn-lg btn-block" onClick={() => navigate('#/checkout')}>
            Checkout
          </button>
          <button
            className="btn btn-quiet btn-block"
            style={{ marginTop: 8 }}
            onClick={() => navigate('#/')}
          >
            Continue shopping
          </button>
        </OrderSummary>
      </div>
    </section>
  );
}
